const express = require('express');
const router = express.Router();
const itemSaleController = require('../controllers/itemSaleController');

router.post('/add', itemSaleController.addSale);
router.get('/', itemSaleController.getSales);
router.delete('/:id', itemSaleController.deleteSale);
router.get('/download-pdf', itemSaleController.downloadPdf);

module.exports = router;
