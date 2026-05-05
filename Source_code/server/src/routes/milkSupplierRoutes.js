const express = require('express');
const router = express.Router();
const milkSupplierController = require('../controllers/milkSupplierController');
router.post('/add', milkSupplierController.addSupplier);
router.put('/update/:id', milkSupplierController.updateSupplier);
router.delete('/delete/:id', milkSupplierController.deleteSupplier);
router.get('/all', milkSupplierController.getAllSuppliers);
router.post('/payment', milkSupplierController.addPayment);
router.put('/payment/:id', milkSupplierController.updatePayment);
router.delete('/payment/delete/:id', milkSupplierController.deletePayment);
router.get('/:id/history', milkSupplierController.getSupplierHistory);
router.post('/:id/generate-report', milkSupplierController.generateReport);

router.post('/:id/generate-report', milkSupplierController.generateReport);
router.post('/period-bills', milkSupplierController.getPeriodBills);
router.post('/generate-bill-pdf', milkSupplierController.generateBillPdf);

module.exports = router;
