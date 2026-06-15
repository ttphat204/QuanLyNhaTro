const mongoose = require('mongoose');

const roomTypePriceSchema = new mongoose.Schema({
  typeName: { type: String, required: true },
  price: { type: Number, required: true }
});

const systemSettingSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Dịch vụ cố định đã chuyển sang Branch
  // Quản lý giá theo loại phòng
  roomTypePrices: [roomTypePriceSchema],
  
  // Thông tin ngân hàng (cho VietQR)
  bankInfo: {
    bankId: { type: String, default: 'MB' },
    accountNo: { type: String, default: '0987654321' },
    accountName: { type: String, default: 'NGUYEN VAN CHU TRO' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
