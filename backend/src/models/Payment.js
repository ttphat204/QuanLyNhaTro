const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String, // ID from PayOS/Casso or Bank Reference
    unique: true,
    sparse: true
  },
  paymentMethod: {
    type: String,
    enum: ['vietqr', 'cash', 'transfer'],
    default: 'vietqr'
  },
  paymentDate: {
    type: Date
  },
  referenceCode: {
    type: String, // The code used in the QR or transfer content (e.g. QLNT1234)
    unique: true
  },
  rawData: {
    type: Object // Storing the full callback data for debugging/audit
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster lookups
paymentSchema.index({ landlordId: 1, referenceCode: 1 });
paymentSchema.index({ invoiceId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
