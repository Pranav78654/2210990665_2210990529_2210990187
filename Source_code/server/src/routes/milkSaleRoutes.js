const express = require('express');
const router = express.Router();
const milkSaleController = require('../controllers/milkSaleController');

router.post('/add', milkSaleController.addSaleRecord);
router.put('/update/:id', milkSaleController.updateSaleRecord);
router.put('/bulk-update', milkSaleController.bulkUpdateSaleRecords);
router.delete('/delete/:id', milkSaleController.deleteSaleRecord);
router.delete('/bulk-delete', milkSaleController.bulkDeleteSaleRecords);
router.get('/all', milkSaleController.getAllSaleRecords);
router.get('/summary', milkSaleController.getSaleSummary);
router.get('/download-pdf', milkSaleController.generatePdf);

module.exports = router;
