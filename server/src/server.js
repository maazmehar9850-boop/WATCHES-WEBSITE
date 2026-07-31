const app = require('./app');
const validateEnv = require('./config/validateEnv');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// On Vercel the app is exported as a serverless function — do not listen.
if (!process.env.VERCEL) {
  validateEnv();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    // Warm DB in background — do not crash the process if Atlas is briefly unreachable
    connectDB().catch((err) => {
      console.error(`MongoDB startup warning: ${err.message}`);
      console.error('Server is up; API routes will retry DB on each request.');
    });
  });
}

module.exports = app;
