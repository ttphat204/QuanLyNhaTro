const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên chi nhánh/khu vực'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Vui lòng nhập địa chỉ chi nhánh'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Các khoản giá dịch vụ của Chi nhánh
  electricityPrice: { type: Number, default: 3500 },
  waterPrice: { type: Number, default: 20000 },
  internetPrice: { type: Number, default: 100000 },
  garbagePrice: { type: Number, default: 50000 },

  priceTiers: [{
    name: { type: String, required: [true, 'Vui lòng nhập tên mức giá'] },
    price: { type: Number, required: [true, 'Vui lòng nhập đơn giá'] },
    description: { type: String, trim: true }
  }]
}, {
  timestamps: true
});

// Index to ensure branch name is unique per landlord
branchSchema.index({ landlordId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Branch', branchSchema);
