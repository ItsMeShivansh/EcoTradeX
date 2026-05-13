/**
 * Input validation middleware
 */

function validateRequired(fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => !req.body[f] || !req.body[f].toString().trim());
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missing
      });
    }
    next();
  };
}

function validateEmail(req, res, next) {
  const email = req.body.email;
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
  }
  next();
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Basic XSS sanitization
        req.body[key] = req.body[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .trim();
      }
    }
  }
  next();
}

module.exports = { validateRequired, validateEmail, sanitizeBody };
