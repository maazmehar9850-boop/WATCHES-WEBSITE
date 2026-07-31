const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

// @desc    Get all users (admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Block / unblock user
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user.role === 'admin') {
      return next(new AppError('Cannot block admin users', 400));
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      success: true,
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) return next(new AppError('Product not found', 404));

    const idx = user.wishlist.findIndex((id) => id.toString() === productId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    await user.populate('wishlist');
    res.json({
      success: true,
      wishlist: user.wishlist,
      added: idx === -1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'category', select: 'name slug' },
    });
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      revenueAgg,
      recentOrders,
      monthlyRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: revenueAgg[0]?.total || 0,
        recentOrders,
        monthlyRevenue,
        statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};
