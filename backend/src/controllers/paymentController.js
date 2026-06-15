const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// @desc    Lấy danh sách tất cả giao dịch thanh toán
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = async (req, res) => {
  try {
    const { status, invoiceId } = req.query;
    let query = { landlordId: req.user.landlordId };

    if (status) query.status = status;
    if (invoiceId) query.invoiceId = invoiceId;

    const payments = await Payment.find(query)
      .populate({
        path: 'invoiceId',
        select: 'invoiceNumber totalAmount month year',
        populate: { path: 'room', select: 'roomNumber' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

// @desc    Ghi nhận một giao dịch thanh toán mới (Thủ công hoặc từ Webhook)
// @route   POST /api/payments
// @access  Private/Admin
exports.createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod, transactionId, referenceCode, note } = req.body;

    // 1. Kiểm tra hóa đơn có tồn tại và thuộc về chủ nhà này không
    const invoice = await Invoice.findOne({ _id: invoiceId, landlordId: req.user.landlordId })
      .populate('tenant', 'fullName email')
      .populate('room', 'roomNumber');
      
    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn hợp lệ' });
    }

    // 2. Tạo bản ghi thanh toán
    const payment = await Payment.create({
      landlordId: req.user.landlordId,
      invoiceId,
      amount,
      status: 'completed', // Nếu tạo thủ công mặc định là completed
      paymentMethod: paymentMethod || 'cash',
      transactionId,
      referenceCode,
      paymentDate: new Date(),
      note
    });

    // 3. Cập nhật trạng thái hóa đơn nếu số tiền khớp hoặc lớn hơn
    // (Trong thực tế có thể xử lý thanh toán từng phần, nhưng tạm thời mặc định thanh toán đủ)
    if (amount >= invoice.totalAmount) {
      invoice.status = 'paid';
      invoice.paidDate = new Date();
      invoice.paymentMethod = paymentMethod || 'cash';
      await invoice.save();
      
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
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo thanh toán: ' + error.message });
  }
};

// @desc    Lấy chi tiết một giao dịch
// @route   GET /api/payments/:id
// @access  Private/Admin
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, landlordId: req.user.landlordId })
      .populate('invoiceId');
      
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
