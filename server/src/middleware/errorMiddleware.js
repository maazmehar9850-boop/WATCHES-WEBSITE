const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, statusCode: err.statusCode || 500 };

  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`Duplicate value for ${field}`, 400);
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(messages.join('. '), 400);
  }
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please log in again.', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`Not found - ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound };
