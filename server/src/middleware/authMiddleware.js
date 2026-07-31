const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User no longer exists.', 401));
    if (user.isBlocked) return next(new AppError('Your account has been blocked.', 403));

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  next(new AppError('Admin access required.', 403));
};

const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization?.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
    next();
  } catch {
    next();
  }
};

module.exports = { protect, admin, optionalAuth };
