const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'payment_reminder',   // Nhắc đóng tiền trước hạn
      'invoice_created',    // Hóa đơn mới được tạo
      'invoice_overdue',    // Hóa đơn quá hạn
      'payment_received',   // Xác nhận đã thanh toán
      'contract_expiring',  // Hợp đồng sắp hết hạn
      'system'              // Thông báo hệ thống
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // Liên kết tới đối tượng liên quan
  relatedModel: {
    type: String,
    enum: ['Invoice', 'Contract', 'Room', 'User', null]
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index cho truy vấn nhanh: lấy notification chưa đọc của user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Tự động xóa notification cũ hơn 90 ngày
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
