const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Decimal } = require('@prisma/client/runtime/library');

const seedProducts = async () => {
    const defaultProducts = [
        { name: 'Paneer', defaultRate: 320, unit: 'Kg' },
        { name: 'Dahi', defaultRate: 60, unit: 'Kg' },
        { name: 'Khoya', defaultRate: 400, unit: 'Kg' },
        { name: 'Makhan', defaultRate: 550, unit: 'Kg' },
    ];

    for (const p of defaultProducts) {
        const existing = await prisma.product.findUnique({
            where: { name: p.name },
        });

        if (!existing) {
            await prisma.product.create({
                data: {
                    name: p.name,
                    defaultRate: new Decimal(p.defaultRate),
                    unit: p.unit,
                },
            });
            console.log(`Created product: ${p.name}`);
        }
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

const addProduct = async (req, res) => {
    try {
        const { name, defaultRate, unit } = req.body;
        const existing = await prisma.product.findUnique({ where: { name } });
        if (existing) {
            return res.status(400).json({ message: 'Product already exists' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                defaultRate: new Decimal(defaultRate),
                unit: unit || 'Kg',
            },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, defaultRate, unit } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                defaultRate: new Decimal(defaultRate),
                unit,
            },
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for sales before deleting?
        const salesCount = await prisma.productSale.count({ where: { productId: id } });
        if (salesCount > 0) {
            return res.status(400).json({ message: 'Cannot delete product with existing sales records' });
        }

        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

module.exports = {
    seedProducts,
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
};
