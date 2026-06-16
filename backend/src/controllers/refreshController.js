// src/controllers/refreshController.js
const jwt = require('jsonwebtoken');

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token cookie)
exports.refresh = (req, res, next) => {
  // Try to get refresh token from cookie first, then Authorization header
  let refreshToken = req.cookies.refreshToken;
  if (!refreshToken && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      refreshToken = parts[1];
    }
  }

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Missing refresh token' });
  }

  // Verify refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    // Issue new access token
    const newAccess = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
    });
    const newRefresh = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
    });
    // Update refresh cookie
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.json({ success: true, token: newAccess });
  });
};
