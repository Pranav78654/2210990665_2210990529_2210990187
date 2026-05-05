const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');
const pdfService = require('../services/pdfService');

const prisma = new PrismaClient();

const addSupplier = async (req, res) => {
    try {
        const { name, rate } = req.body;

        const supplier = await prisma.milkSupplier.create({
            data: {
                name,
                rate: new Decimal(rate),
            },
        });

        res.status(201).json({ message: 'Supplier added successfully', supplier });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding supplier', error: error.message });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rate } = req.body;

        const updatedSupplier = await prisma.milkSupplier.update({
            where: { id },
            data: {
                name,
                rate: rate ? new Decimal(rate) : undefined,
            },
        });

        res.json({ message: 'Supplier updated successfully', supplier: updatedSupplier });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating supplier', error: error.message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.milkSupplier.delete({
            where: { id },
        });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting supplier', error: error.message });
    }
};

const getAllSuppliers = async (req, res) => {
    try {
        const { name } = req.query;
        const where = {};

        if (name) {
            where.name = {
                contains: name,
                mode: 'insensitive',
            };
        }

        const suppliers = await prisma.milkSupplier.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                // We could include relations but for performance/agg it's better to aggregate separately if list is long.
                // But for now, let's do separate aggregation or per-item logic.
                // Actually, let's just fetch everything and map.
            }
        });

        // Calculate Balances
        const suppliersWithBalance = await Promise.all(suppliers.map(async (s) => {
            const milkSum = await prisma.milkRecord.aggregate({
                where: { supplierId: s.id },
                _sum: { amount: true }
            });
            const paymentSum = await prisma.supplierPayment.aggregate({
                where: { supplierId: s.id },
                _sum: { amount: true }
            });

            const totalMilkAmount = milkSum._sum.amount ? new Decimal(milkSum._sum.amount) : new Decimal(0);
            const totalPaid = paymentSum._sum.amount ? new Decimal(paymentSum._sum.amount) : new Decimal(0);

            // Balance = Milk Given (Credit) - Payment Recd (Debit)
            const balance = totalMilkAmount.minus(totalPaid);

            return {
                ...s,
                balance: balance.toFixed(2),
                totalMilkAmount: totalMilkAmount.toFixed(2),
                totalPaid: totalPaid.toFixed(2)
            };
        }));

        res.json(suppliersWithBalance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
    }
};

const addPayment = async (req, res) => {
    try {
        const { supplierId, amount, date, description } = req.body;

        const payment = await prisma.supplierPayment.create({
            data: {
                supplierId,
                amount: new Decimal(amount),
                date: new Date(date),
                description
            }
        });

        res.status(201).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding payment', error: error.message });
    }
};

const getSupplierHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const milkRecords = await prisma.milkRecord.findMany({
            where: { supplierId: id },
            orderBy: { date: 'desc' }
        });

        const payments = await prisma.supplierPayment.findMany({
            where: { supplierId: id },
            orderBy: { date: 'desc' }
        });

        // Combine
        const combinedHistory = [
            ...milkRecords.map(r => ({
                id: r.id,
                date: r.date,
                type: 'MILK_SUPPLY',
                description: `${r.shift === 'MORNING' ? 'Morning' : 'Evening'} - ${r.quantity}Kg (${r.fat} Fat / ${r.snf} SNF)`,
                amount: r.amount,
                isCredit: true, // Increases Balance (We owe them)
                details: r
            })),
            ...payments.map(p => ({
                id: p.id,
                date: p.date,
                type: 'PAYMENT',
                description: p.description || 'Payment Given',
                amount: p.amount,
                isCredit: false, // Decreases Balance (We paid them)
                details: p
            }))
        ];

        // Sort descending
        combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(combinedHistory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};

const generateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { history, dateRange } = req.body;

        const supplier = await prisma.milkSupplier.findUnique({ where: { id } });

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Generate PDF
        // We can reuse a similar function structure or create a new one.
        // Let's assume pdfService.generateSupplierReportPdf exists.
        pdfService.generateSupplierReportPdf(supplier, history, dateRange || {}, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

const getPeriodBills = async (req, res) => {
    try {
        // 1. Destructure filters
        const { startDate, endDate, deductAdvances, supplierName, shift } = req.body;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // 2. Filter Suppliers
        const supplierWhere = {};
        if (supplierName) {
            supplierWhere.name = {
                contains: supplierName,
                mode: 'insensitive' 
            };
        }

        const suppliers = await prisma.milkSupplier.findMany({
            where: supplierWhere,
            orderBy: { name: 'asc' }
        });

        // 3. Calculate bills for all matching suppliers
        const allBills = await Promise.all(suppliers.map(async (supplier) => {
            
            const recordWhere = {
                supplierId: supplier.id,
                date: { gte: start, lte: end }
            };

            if (shift && shift !== 'All') {
                recordWhere.shift = shift;
            }

            const milkStats = await prisma.milkRecord.aggregate({
                where: recordWhere,
                _sum: {
                    quantity: true,
                    fatKg: true,
                    snfKg: true,
                    amount: true
                }
            });

            let totalAdvance = new Decimal(0);
            if (deductAdvances) {
                const payments = await prisma.supplierPayment.aggregate({
                    where: {
                        supplierId: supplier.id,
                        date: { gte: start, lte: end }
                    },
                    _sum: { amount: true }
                });
                totalAdvance = payments._sum.amount ? new Decimal(payments._sum.amount) : new Decimal(0);
            }

            const totalMilkAmount = milkStats._sum.amount ? new Decimal(milkStats._sum.amount) : new Decimal(0);
            const netPayable = totalMilkAmount.minus(totalAdvance);

            return {
                id: supplier.id,
                name: supplier.name,
                rate: supplier.rate,
                // Ensure quantity is returned as a basic number or 0 for easier filtering
                totalQuantity: milkStats._sum.quantity ? Number(milkStats._sum.quantity) : 0, 
                totalFatKg: milkStats._sum.fatKg || 0,
                totalSnfKg: milkStats._sum.snfKg || 0,
                totalMilkAmount: totalMilkAmount.toFixed(2),
                totalAdvance: totalAdvance.toFixed(2),
                netPayable: netPayable.toFixed(2)
            };
        }));

        // 4. FILTER: Remove suppliers with 0 Milk Quantity
        const activeBills = allBills.filter(bill => bill.totalQuantity > 0);

        res.json(activeBills);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating bills', error: error.message });
    }
};

const generateBillPdf = async (req, res) => {
    try {
        // Extract filters (which contains 'shift' and 'supplierName')
        const { bills, dateRange, filters } = req.body; 
        
        // Pass filters to the service function
        pdfService.generateBillListPdf(bills, dateRange, filters, res); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating bill PDF', error: error.message });
    }
};

const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, date, description } = req.body;

        const updatedPayment = await prisma.supplierPayment.update({
            where: { id },
            data: {
                amount: new Decimal(amount),
                date: new Date(date),
                description
            }
        });

        res.json(updatedPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating payment', error: error.message });
    }
};


const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.supplierPayment.delete({
            where: { id },
        });
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting payment', error: error.message });
    }
};

module.exports = {
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getAllSuppliers,
    addPayment,
    updatePayment,
    deletePayment,
    getSupplierHistory,
    generateReport,
    getPeriodBills,
    generateBillPdf
};
