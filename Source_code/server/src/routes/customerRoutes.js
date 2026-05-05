const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getCustomerBalances);
router.post('/add', customerController.addCustomer);
router.put('/update/:id', customerController.updateCustomer);
router.delete('/delete/:id', customerController.deleteCustomer);
router.get('/balances', customerController.getCustomerBalances);
router.get('/:id/history', customerController.getCustomerHistory);
router.post('/payment', customerController.addPayment);
router.put('/payment/:id', customerController.updatePayment); // <--- NEW Update Route
router.delete('/payment/delete/:id', customerController.deletePayment);
router.post('/:id/generate-report', customerController.generateReport);

module.exports = router;
