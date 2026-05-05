const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.post('/add', productController.addProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/seed', async (req, res) => {
    try {
        await productController.seedProducts();
        res.json({ message: 'Products seeded' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding products', error: error.message });
    }
});

module.exports = router;
