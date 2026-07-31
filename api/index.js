/**
 * Vercel serverless API — same domain as the Vite client (/api/*).
 * Client already calls `/api` when VITE_API_URL is empty.
 */
module.exports = require('../server/src/app');
