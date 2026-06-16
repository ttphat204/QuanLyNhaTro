const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phoneNumber
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400);
      throw new Error('Vui lòng cung cấp email và mật khẩu');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Thông tin đăng nhập không hợp lệ');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Thông tin đăng nhập không hợp lệ');
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// Get tokens from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create access token (short-lived)
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m'
  });
  // Create refresh token (long-lived)
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d'
  });
  // Set refresh token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'Strict',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days in ms (matches default)
  });
  // Return access token in body
  res.status(statusCode).json({
    success: true,
    token: accessToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
};
exports.logout = (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict', secure: process.env.COOKIE_SECURE === 'true' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
