const crypto = require('crypto');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

/**
 * @desc    Xử lý Webhook từ các cổng thanh toán (PayOS, Casso, v.v.)
 * @route   POST /api/webhooks/payment
 * @access  Public (Security via Signature)
 */
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // 1. Kiểm tra chữ ký (Security)
    // Trong thực tế, bạn sẽ lấy WEBHOOK_SECRET từ PayOS/Casso Dashboard
    const signature = req.headers['x-api-signature'] || req.headers['secure-token'];
    const webhookSecret = process.env.WEBHOOK_SECRET || 'your_default_secret_for_dev';

    if (signature) {
        // Ví dụ kiểm tra HMAC đơn giản (tùy cổng thanh toán sẽ có cách verify khác nhau)
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(webhookData))
            .digest('hex');
            
        // Ghi chú: Một số cổng thanh toán dùng checksum thay vì HMAC, logic này có thể tùy biến
        if (signature !== expectedSignature && process.env.NODE_ENV === 'production') {
            console.error('Webhook: Chữ ký không hợp lệ!');
            return res.status(400).json({ message: 'Invalid signature' });
        }
    }

    // 2. Trích xuất thông tin giao dịch
    // Giả định cấu trúc chung: { data: { desc: "...", amount: 1000, reference: "..." } }
    const data = webhookData.data || webhookData;
    const description = data.description || data.content || '';
    const amount = data.amount || 0;
    const reference = data.reference || data.transactionId || 'WEBHOOK-' + Date.now();

    if (!description) {
        return res.status(200).json({ message: 'Không tìm thấy nội dung chuyển khoản, bỏ qua.' });
    }

    // 3. Tìm mã hóa đơn bằng Regex (Tìm chuỗi bắt đầu bằng QLNT theo sau là INV-...)
    const match = description.match(/QLNT\s+(INV-[\w-]+)/i);
    if (!match) {
        console.log(`Webhook: Giao dịch không chứa mã đối soát hợp lệ: ${description}`);
        return res.status(200).json({ success: true, message: 'Not an invoice payment' });
    }

    const invoiceNumber = match[1].toUpperCase();

    // 4. Đối soát với Database
    const invoice = await Invoice.findOne({ invoiceNumber: invoiceNumber })
        .populate('tenant', 'fullName email')
        .populate('room', 'roomNumber');
        
    if (!invoice) {
        console.error(`Webhook: Không tìm thấy hóa đơn có mã ${invoiceNumber}`);
        return res.status(404).json({ message: 'Invoice not found' });
    }

    // 5. Kiểm tra trạng thái hóa đơn
    if (invoice.status === 'paid') {
        return res.status(200).json({ success: true, message: 'Invoice already paid' });
    }

    // 6. Ghi nhận giao dịch vào bảng Payment
    const newPayment = await Payment.create({
        landlordId: invoice.landlordId,
        invoiceId: invoice._id,
        amount: amount,
        status: 'completed',
        transactionId: reference,
        paymentMethod: 'vietqr',
        referenceCode: invoiceNumber,
        paymentDate: new Date(),
        rawData: webhookData,
        note: `Auto-reconciled from Webhook: ${description}`
    });

    // 7. Cập nhật hóa đơn
    // Chấp nhận thanh toán nếu số tiền >= tổng hóa đơn (có thể xử lý thanh toán từng phần sau)
    if (amount >= invoice.totalAmount) {
        invoice.status = 'paid';
        invoice.paidDate = new Date();
        invoice.paymentMethod = 'vietqr';
        await invoice.save();
        console.log(`✅ Webhook: Hóa đơn ${invoiceNumber} đã được thanh toán tự động.`);

        // Gửi email biên lai
        if (invoice.tenant && invoice.tenant.email) {
            const { sendPaymentReceipt } = require('../utils/emailService');
            sendPaymentReceipt({
                to: invoice.tenant.email,
                tenantName: invoice.tenant.fullName,
                roomNumber: invoice.room ? invoice.room.roomNumber : 'Không xác định',
                totalAmount: amount,
                invoiceNumber: invoice.invoiceNumber,
                paymentDate: invoice.paidDate,
                paymentMethod: invoice.paymentMethod
            });
        }
    } else {
        console.log(`⚠️ Webhook: Hóa đơn ${invoiceNumber} thanh toán thiếu (${amount}/${invoice.totalAmount}).`);
    }

    res.status(200).json({ success: true, paymentId: newPayment._id });

  } catch (error) {
    console.error('❌ Webhook Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
