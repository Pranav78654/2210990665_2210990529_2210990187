const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');
const pdfService = require('../services/pdfService');

const prisma = new PrismaClient();

const getCustomers = async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

const addCustomer = async (req, res) => {
    try {
        const { name, mobile, address } = req.body;
        const customer = await prisma.customer.create({
            data: { name, mobile, address },
        });
        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding customer', error: error.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, mobile, address } = req.body;
        const customer = await prisma.customer.update({
            where: { id },
            data: { name, mobile, address },
        });
        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.customer.delete({
            where: { id },
        });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
};

const getCustomerBalances = async (req, res) => {
    try {
        const customers = await prisma.customer.findMany();

        const balances = await Promise.all(customers.map(async (customer) => {
            // Fetch PENDING Milk Sales
            const milkSales = await prisma.milkSaleRecord.aggregate({
                where: { customerId: customer.id, paymentStatus: 'PENDING' },
                _sum: { amount: true }
            });

            // Fetch PENDING Product Sales
            const productSales = await prisma.productSale.aggregate({
                where: { customerId: customer.id, paymentStatus: 'PENDING' },
                _sum: { amount: true }
            });

            
            const payments = await prisma.customerPayment.aggregate({
                where: { customerId: customer.id },
                _sum: { amount: true }
            });

            const totalMilk = milkSales._sum.amount ? new Decimal(milkSales._sum.amount) : new Decimal(0);
            const totalProducts = productSales._sum.amount ? new Decimal(productSales._sum.amount) : new Decimal(0);
            const totalPaid = payments._sum.amount ? new Decimal(payments._sum.amount) : new Decimal(0);

           
            const totalDue = totalMilk.plus(totalProducts).minus(totalPaid);

            return {
                ...customer,
                totalDue: totalDue.toFixed(2),
               
                totalSalesPending: totalMilk.plus(totalProducts).toFixed(2),
                totalPaid: totalPaid.toFixed(2)
            };
        }));

        res.json(balances);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching customer balances', error: error.message });
    }
};

const getCustomerHistory = async (req, res) => {
    try {
        const { id } = req.params;

        

        const milkSales = await prisma.milkSaleRecord.findMany({
            where: { customerId: id },
            orderBy: { date: 'desc' },
        });

        const productSales = await prisma.productSale.findMany({
            where: { customerId: id },
            include: { product: true },
            orderBy: { date: 'desc' },
        });

        const payments = await prisma.customerPayment.findMany({
            where: { customerId: id },
            orderBy: { date: 'desc' },
        });

       
        const combinedHistory = [
            ...milkSales.map(s => ({
                id: s.id,
                date: s.date,
                type: 'MILK',
                description: `${s.shift} - ${s.quantity}Kg @ ${s.rate}/L`,
                amount: s.amount,
                paymentStatus: s.paymentStatus,
                isCredit: true, 
                details: s
            })),
            ...productSales.map(s => ({
                id: s.id,
                date: s.date,
                type: 'ITEM',
                description: `${s.product.name} - ${s.quantity}${s.product.unit} @ ${s.rate}`,
                amount: s.amount,
                paymentStatus: s.paymentStatus,
                isCredit: true, 
                details: s
            })),
            ...payments.map(p => ({
                id: p.id,
                date: p.date,
                type: 'PAYMENT',
                description: p.description || 'Payment Received',
                amount: p.amount,
                paymentStatus: 'PAID',
                isCredit: false, 
                details: p
            }))
        ];

        
        combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(combinedHistory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching customer history', error: error.message });
    }
};

const addPayment = async (req, res) => {
    try {
        const { customerId, amount, date, description } = req.body;

        const payment = await prisma.customerPayment.create({
            data: {
                customerId,
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

const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, date, description } = req.body;

        const payment = await prisma.customerPayment.update({
            where: { id },
            data: {
                amount: new Decimal(amount),
                date: new Date(date),
                description
            }
        });
        res.json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating payment', error: error.message });
    }
};


const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.customerPayment.delete({
            where: { id }
        });
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting payment', error: error.message });
    }
};

const generateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { history, dateRange } = req.body;

        const customer = await prisma.customer.findUnique({ where: { id } });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        
        pdfService.generateCustomerReportPdf(customer, history, dateRange || {}, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
};

module.exports = {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerBalances,
    getCustomerHistory,
    addPayment,
    updatePayment, 
    deletePayment,
    generateReport
};
