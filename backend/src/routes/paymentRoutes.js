const express = require('express');
const router = express.Router();
const { getPayments, createPayment, getPaymentById } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Tất cả các route thanh toán yêu cầu đăng nhập
router.use(protect);

// Chỉ landlord hoặc manager mới có quyền quản lý thanh toán
router.use(authorize('landlord', 'manager', 'super_admin'));

router.route('/')
  .get(getPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPaymentById);

module.exports = router;
