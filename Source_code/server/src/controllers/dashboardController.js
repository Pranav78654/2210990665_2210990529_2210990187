const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
    try {
        // Get start and end of today
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // Fetch Morning Milk
        const morningMilk = await prisma.milkRecord.aggregate({
            _sum: {
                quantity: true,
            },
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
                shift: 'MORNING',
            },
        });

        // Fetch Evening Milk
        const eveningMilk = await prisma.milkRecord.aggregate({
            _sum: {
                quantity: true,
            },
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
                shift: 'EVENING',
            },
        });

        // Fetch Total Milk Sales Amount and Quantity
        const totalMilkSales = await prisma.milkSaleRecord.aggregate({
            _sum: {
                amount: true,
                quantity: true,
            },
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        });

        // Fetch Total Item Sales Amount
        const totalItemSales = await prisma.productSale.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        });

        // Fetch Item Sales Summary (Grouped by Product Name)
        const itemSales = await prisma.productSale.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        });

        // Resolve product names for the summary
        const itemSalesWithNames = await Promise.all(itemSales.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });
            // Convert to simple object { name: 'Paneer', quantity: 5, unit: 'Kg' }
            return {
                name: product ? product.name : 'Unknown',
                quantity: parseFloat(item._sum.quantity || 0),
                unit: product ? product.unit : 'Kg'
            };
        }));

        // Add Milk to the Item Sales list
        if (totalMilkSales._sum.quantity) {
            itemSalesWithNames.unshift({
                name: 'Milk',
                quantity: parseFloat(totalMilkSales._sum.quantity),
                unit: 'Kg' // Assuming Milk is sold in Kg, or Ltr if preferred by user context
            });
        }

        // Calculate combined total sales
        const combinedTotalSales = (parseFloat(totalMilkSales._sum.amount) || 0) + (parseFloat(totalItemSales._sum.amount) || 0);

        res.json({
            morningMilk: morningMilk._sum.quantity || 0,
            eveningMilk: eveningMilk._sum.quantity || 0,
            totalSales: combinedTotalSales,
            itemSales: itemSalesWithNames,
            date: now.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
};
