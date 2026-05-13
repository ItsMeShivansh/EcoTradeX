const express = require('express');
const { validateRequired, validateEmail, sanitizeBody } = require('../middleware/validation');
const Inquiry = require('../models/Inquiry');

const router = express.Router();

router.post('/', sanitizeBody, validateRequired(['name', 'email']), validateEmail, async (req, res) => {
  try {
    const submission = await Inquiry.create({ ...req.body, type: 'sample-request' });
    console.log(`📦 Sample kit request from ${req.body.name} (${req.body.email}) saved with ID: ${submission.id}`);
    res.json({ success: true, message: 'Sample kit request received. Ships within 48 hours.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save sample request.' });
  }
});

module.exports = router;
