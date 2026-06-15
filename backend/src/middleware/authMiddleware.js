const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    res.status(401);
    return next(new Error('Không có quyền truy cập vào tuyến đường này'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    
    if (req.user) {
      // Normalize landlordId for easy multi-tenant querying
      // If landlord, landlordId is their own ID
      // If manager/tenant, landlordId comes from their profile
      if (req.user.role === 'landlord') {
        req.user.landlordId = req.user._id;
      } else if (req.user.role === 'manager' || req.user.role === 'tenant') {
        req.user.landlordId = req.user.landlordId;
      }
    }

    next();
  } catch (err) {
    res.status(401);
    return next(new Error('Không có quyền truy cập vào tuyến đường này'));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Vai trò người dùng ${req.user.role} không có quyền truy cập`));
    }
    next();
  };
};

// Backward-compatible middleware used by some routes
exports.admin = exports.authorize('landlord', 'manager', 'super_admin');
