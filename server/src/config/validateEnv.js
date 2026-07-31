/**
 * Fail fast if required secrets are missing / unsafe for production.
 * Never log secret values.
 */
function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  if (missing.length) {
    console.error(`Missing required environment variable(s): ${missing.join(', ')}`);
    console.error('Copy server/.env.example → server/.env and fill in real values.');
    process.exit(1);
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
      console.error('JWT_SECRET must be at least 32 characters in production.');
      process.exit(1);
    }
    if (weakPlaceholders.includes(jwt) || /change.?me|luxewatch_jwt_secret/i.test(jwt)) {
      console.error('JWT_SECRET looks like a placeholder — set a strong unique secret in production.');
      process.exit(1);
    }
  }
}

module.exports = validateEnv;
