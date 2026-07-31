const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    statusCode = 400;
    message = `Duplicate value for ${field}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  const showStack =
    process.env.NODE_ENV === 'development' && !process.env.VERCEL;

  res.status(statusCode).json({
    success: false,
    message,
    ...(showStack && { stack: err.stack }),
  });
};

/** Only reached when no earlier route matched */
const notFound = (req, res, next) => {
  next(new AppError(`Not found - ${req.method} ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound };
