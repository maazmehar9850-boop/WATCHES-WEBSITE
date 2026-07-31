const app = require('./app');
const validateEnv = require('./config/validateEnv');

const PORT = process.env.PORT || 5000;

// On Vercel the app is exported as a serverless function — do not listen.
if (!process.env.VERCEL) {
  validateEnv();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
