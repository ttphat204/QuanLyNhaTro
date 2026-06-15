const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Vui lòng xác định chi nhánh cho hóa đơn']
  },
  invoiceNumber: {
    type: String,
    unique: true
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
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  electricity: {
    previous: { type: Number, required: true },
    current: { type: Number, required: true },
    usage: { type: Number, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true }
  },
  water: {
    previous: { type: Number, default: 0 },
    current: { type: Number, default: 0 },
    usage: { type: Number, required: true }, // Số m3 hoặc số người
    price: { type: Number, required: true },
    amount: { type: Number, required: true }
  },
  roomPrice: {
    type: Number,
    required: true
  },
  servicePrice: { type: Number, default: 0 },
  extraFee: { type: Number, default: 0 },
  extraNote: { type: String },
  maintenanceFee: { type: Number, default: 0 },
  maintenanceNote: { type: String },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'vietqr', 'momo'],
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

// Auto generate invoice number if not provided
invoiceSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    const mm = String(this.month).padStart(2, '0');
    const yy = String(this.year).slice(-2);
    // Format: INV-MMYY-ROOM-XXXX
    this.invoiceNumber = `INV-${mm}${yy}-${Date.now().toString().slice(-6)}`;
  }
  next();
});

// Index to ensure 1 invoice per room per month
invoiceSchema.index({ room: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
