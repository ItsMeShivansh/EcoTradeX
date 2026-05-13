const express = require('express');
const { validateRequired, validateEmail, sanitizeBody } = require('../middleware/validation');
const Inquiry = require('../models/Inquiry');

const router = express.Router();

router.post('/', sanitizeBody, validateRequired(['name', 'email']), validateEmail, async (req, res) => {
  try {
    const submission = await Inquiry.create({ ...req.body, type: 'quote-request' });
    console.log(`🎨 Quote request from ${req.body.name} (${req.body.email}) saved with ID: ${submission.id}`);
    res.json({ success: true, message: 'Quote request submitted. Our team will prepare your custom quote.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save quote request.' });
  }
});

module.exports = router;
