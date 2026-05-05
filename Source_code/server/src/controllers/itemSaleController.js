const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();

const pdfService = require('../services/pdfService');

const addSale = async (req, res) => {
    try {
        const { productId, purchaserName, quantity, rate, amount, date, customerId, paymentStatus } = req.body;

        const quantityDec = new Decimal(quantity || 0);
        const rateDec = new Decimal(rate);
        const amountDec = new Decimal(amount || 0);

        let finalQuantity = quantityDec;
        let finalAmount = amountDec;

        // Auto-calculation Logic
        if (quantityDec.greaterThan(0)) {
            // Quantity provided, calculate amount
            finalAmount = quantityDec.mul(rateDec);
        } else if (amountDec.greaterThan(0)) {
            // Amount provided, calculate quantity
            if (rateDec.greaterThan(0)) {
                finalQuantity = amountDec.div(rateDec);
            } else {
                return res.status(400).json({ message: 'Rate must be greater than 0 to calculate quantity from amount' });
            }
        } else {
            return res.status(400).json({ message: 'Either Quantity or Amount is required' });
        }

        const sale = await prisma.productSale.create({
            data: {
                productId,
                purchaserName: purchaserName || 'Cash',
                quantity: finalQuantity,
                rate: rateDec,
                amount: finalAmount,
                date: new Date(date),
                customerId: customerId || null,
                paymentStatus: paymentStatus || 'PAID',
            },
        });

        res.status(201).json({ message: 'Item sale added', sale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding item sale', error: error.message });
    }
};

const getSales = async (req, res) => {
    try {
        // 1. Destructure productId from query
        const { date, startDate, endDate, purchaserName, productId } = req.query;

        const where = {};
        
        // Date Logic
        if (date) {
            where.date = new Date(date);
        } else if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        // Purchaser Name Logic
        if (purchaserName) {
            where.purchaserName = {
                contains: purchaserName,
                mode: 'insensitive',
            };
        }

        // 2. Add Product Filter Logic
        if (productId) {
            where.productId = productId;
        }

        const sales = await prisma.productSale.findMany({
            where,
            include: { product: true },
            orderBy: { date: 'desc' },
        });

        // Calculate totals
        const totals = sales.reduce((acc, sale) => {
            acc.amount += parseFloat(sale.amount);
            acc.quantity += parseFloat(sale.quantity);
            return acc;
        }, { amount: 0, quantity: 0 });

        res.json({ sales, totals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching item sales', error: error.message });
    }
};
const downloadPdf = async (req, res) => {
    try {
        // 1. Destructure productId
        const { startDate, endDate, purchaserName, productId } = req.query;

        const where = {};
        
        // Date Logic
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        // Purchaser Name Logic
        if (purchaserName) {
            where.purchaserName = {
                contains: purchaserName,
                mode: 'insensitive',
            };
        }

        // 2. Add Product Filter Logic
        if (productId) {
            where.productId = productId;
        }

        const sales = await prisma.productSale.findMany({
            where,
            include: { product: true },
            orderBy: { date: 'desc' },
        });

        const totals = sales.reduce((acc, sale) => {
            acc.amount += parseFloat(sale.amount);
            acc.quantity += parseFloat(sale.quantity);
            return acc;
        }, { amount: 0, quantity: 0 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=item-sales.pdf');

        // Pass filters to PDF service so they can be shown in the header if needed
        pdfService.generateItemSalePdf(sales, totals, { startDate, endDate, purchaserName, productId }, res);

    } catch (error) {
        console.error('Error in downloadPdf:', error);
        res.status(500).json({ message: 'Error downloading PDF', error: error.message });
    }
};

const deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.productSale.delete({ where: { id } });
        res.json({ message: 'Item sale deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting item sale', error: error.message });
    }
};

module.exports = {
    addSale,
    getSales,
    deleteSale,
    downloadPdf
};
