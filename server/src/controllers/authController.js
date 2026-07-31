const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/helpers');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email and password', 400));
    }
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    const exists = await User.findOne({ email });
    if (exists) return next(new AppError('Email already registered', 400));

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }
    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked', 403));
    }
    // Storefront is guest-checkout only — login is for admin dashboard
    if (user.role !== 'admin') {
      return next(new AppError('Admin access only. Customers can order as guests.', 403));
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile (name / phone only — email is locked)
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (req.body.email && req.body.email !== user.email) {
      return next(new AppError('Email cannot be changed. Contact a system administrator.', 403));
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 400));
    }
    if (!newPassword || newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
