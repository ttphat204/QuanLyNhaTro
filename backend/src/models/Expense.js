const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên/nội dung chi phí'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Vui lòng nhập số tiền chi'],
    min: [0, 'Số tiền không được âm']
  },
  category: {
    type: String,
    enum: ['maintenance', 'utilities', 'salary', 'tax', 'other'],
    default: 'other'
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  maintenanceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceRequest'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
