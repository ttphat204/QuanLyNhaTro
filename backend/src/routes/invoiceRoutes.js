const express = require('express');
const router = express.Router();
const { 
  getRoomsForInvoicing, 
  createOrUpdateInvoice, 
  getInvoices, 
  updateInvoiceStatus,
  getMyInvoices 
} = require('../controllers/invoiceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes cho Admin
router.get('/prepare', protect, admin, getRoomsForInvoicing);
router.get('/', protect, admin, getInvoices);
router.post('/', protect, admin, createOrUpdateInvoice);
router.put('/:id/status', protect, admin, updateInvoiceStatus);

// Routes cho Tenant
router.get('/my-invoices', protect, getMyInvoices);

module.exports = router;
