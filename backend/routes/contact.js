const express = require('express');
const { validateRequired, validateEmail, sanitizeBody } = require('../middleware/validation');
const Inquiry = require('../models/Inquiry');

const router = express.Router();

router.post('/', sanitizeBody, validateRequired(['name', 'email']), validateEmail, async (req, res) => {
  try {
    const submission = await Inquiry.create({ ...req.body, type: 'contact' });
    console.log(`📩 Contact inquiry from ${req.body.name} (${req.body.email}) saved with ID: ${submission.id}`);
    res.json({ success: true, message: 'Inquiry received. We will respond within 24 hours.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save inquiry.' });
  }
});

module.exports = router;
