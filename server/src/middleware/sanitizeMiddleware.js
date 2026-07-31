/** Lightweight NoSQL injection scrub — Express 5 safe (no req.query reassignment) */
function scrub(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(scrub);
  if (typeof value !== 'object') return value;

  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (key.startsWith('$')) continue;
    out[key] = scrub(val);
  }
  return out;
}

const sanitizeRequest = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach((k) => {
        if (k.startsWith('$')) delete req.body[k];
        else req.body[k] = scrub(req.body[k]);
      });
    }
  } catch {
    /* ignore */
  }
  next();
};

module.exports = sanitizeRequest;
