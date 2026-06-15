const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
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
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sự cố'],
    trim: true
  },
  images: [{
    type: String
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  cost: {
    type: Number,
    default: 0
  },
  paidBy: {
    type: String,
    enum: ['landlord', 'tenant'],
    default: 'landlord'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'invoiced', 'paid'],
    default: 'pending'
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
