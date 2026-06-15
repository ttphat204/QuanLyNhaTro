const express = require('express');
const router = express.Router();
const { handlePaymentWebhook } = require('../controllers/webhookController');

// Route này công khai để các dịch vụ thanh toán gọi vào
// Bảo mật dựa trên Signature kiểm tra bên trong controller
router.post('/payment', handlePaymentWebhook);

module.exports = router;
