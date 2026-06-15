const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Vui lòng xác định chi nhánh cho hợp đồng']
  },
  contractNumber: {
    type: String,
    unique: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Vui lòng chọn phòng']
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vui lòng chọn người thuê']
  },
  startDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày bắt đầu']
  },
  endDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày hết hạn']
  },
  deposit: {
    type: Number,
    required: [true, 'Vui lòng nhập tiền cọc'],
    default: 0
  },
  rentPrice: {
    type: Number,
    required: [true, 'Vui lòng nhập giá thuê thực tế']
  },
  basePrice: {
    type: Number,
    required: [true, 'Vui lòng lưu lại giá gốc của phòng tại thời điểm ký']
  },
  electricityPrice: { type: Number, default: 3500 },
  waterPrice: { type: Number, default: 20000 },
  waterType: { type: String, enum: ['per_m3', 'per_person'], default: 'per_m3' },
  
  // Dịch vụ chi tiết
  hasWifi: { type: Boolean, default: true },
  wifiPrice: { type: Number, default: 100000 },
  hasTrash: { type: Boolean, default: true },
  trashPrice: { type: Number, default: 50000 },
  hasOtherService: { type: Boolean, default: false },
  otherServicePrice: { type: Number, default: 0 },
  
  servicePrice: { type: Number, default: 150000 }, // Tổng phí dịch vụ (Legacy support)
  status: {
    type: String,
    enum: ['active', 'expired', 'terminated'],
    default: 'active'
  },
  contractFile: {
    type: String
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

// Auto generate contract number if not provided
contractSchema.pre('save', function(next) {
  if (!this.contractNumber) {
    this.contractNumber = 'HD-' + Date.now().toString().slice(-8);
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
