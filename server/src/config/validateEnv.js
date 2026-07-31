/**
 * Fail fast if required secrets are missing / unsafe for production.
 * Never log secret values.
 * Throws on Vercel (never process.exit — that kills the serverless isolate).
 */
function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  const fail = (message) => {
    console.error(message);
    if (process.env.VERCEL) {
      const err = new Error(message);
      err.statusCode = 500;
      throw err;
    }
    process.exit(1);
  };

  if (missing.length) {
    fail(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Set them in Vercel Project Settings → Environment Variables (or server/.env locally).'
    );
  }

  const jwt = process.env.JWT_SECRET.trim();
  const weakPlaceholders = [
    'change_me_to_a_long_random_secret',
    'your_secret',
    'secret',
    'jwt_secret',
  ];

  if (process.env.NODE_ENV === 'production') {
    if (jwt.length < 32) {
      fail('JWT_SECRET must be at least 32 characters in production.');
    }
    if (weakPlaceholders.includes(jwt) || /change.?me|luxewatch_jwt_secret/i.test(jwt)) {
      fail('JWT_SECRET looks like a placeholder — set a strong unique secret in production.');
    }
  }
}

module.exports = validateEnv;
