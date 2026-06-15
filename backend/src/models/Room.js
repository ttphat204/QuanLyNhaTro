const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Vui lòng chọn chi nhánh cho phòng này']
  },
  roomNumber: {
    type: String,
    required: [true, 'Vui lòng nhập số phòng'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Vui lòng chọn loại phòng'],
    default: 'Phòng đơn'
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá thuê']
  },
  priceTierId: {
    type: mongoose.Schema.Types.ObjectId
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  utilities: [{
    type: String
  }],
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  floor: {
    type: Number,
    default: 1
  },
  area: {
    type: Number // m2
  },
  residents: [{
    fullName: String,
    phoneNumber: String,
    idCard: String,
    hometown: String,
    relationship: String, // e.g., 'Vợ', 'Con', 'Bạn'
  }]
}, {
  timestamps: true
});

roomSchema.index({ landlordId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
