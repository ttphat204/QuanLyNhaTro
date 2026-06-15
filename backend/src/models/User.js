const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ'],
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only if not using Google Auth
    },
    select: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'landlord', 'tenant', 'manager'],
    default: 'tenant', 
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: 'Reference to the Landlord if the user is a tenant or manager'
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    description: 'The branch where the tenant resides'
  },
  assignedBranches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  avatar: {
    type: String,
    default: 'https://www.gravatar.com/avatar/?d=mp',
  },
  phoneNumber: {
    type: String,
  },
  idCard: {
    type: String,
    trim: true,
    description: 'Số CCCD/CMND'
  },
  hometown: {
    type: String,
    trim: true,
    description: 'Quê quán'
  },
  birthday: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
