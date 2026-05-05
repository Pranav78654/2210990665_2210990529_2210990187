const express = require('express');
const router = express.Router();
const milkRecordController = require('../controllers/milkRecordController');

router.post('/add', milkRecordController.addRecord);
router.put('/update/:id', milkRecordController.updateRecord);
router.put('/bulk-update', milkRecordController.bulkUpdateRecords);
router.delete('/bulk-delete', milkRecordController.bulkDeleteRecords);
router.delete('/delete/:id', milkRecordController.deleteRecord);
router.get('/all', milkRecordController.getAllRecords);
router.get('/summary', milkRecordController.getRecordsSummary);
router.get('/download-pdf', milkRecordController.generatePdf);
module.exports = router;
