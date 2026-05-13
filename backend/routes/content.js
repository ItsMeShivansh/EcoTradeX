/**
 * Content API — Public endpoint to serve dynamic site content
 */
const express = require('express');
const SiteContent = require('../models/SiteContent');
const router = express.Router();

// GET all content
router.get('/', async (req, res) => {
  try {
    res.json(await SiteContent.get());
  } catch (e) {
    res.status(500).json({ error: 'Failed to load content' });
  }
});

// GET specific section
router.get('/:section', async (req, res) => {
  try {
    const content = await SiteContent.get();
    const section = content[req.params.section];
    if (section === undefined) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load content' });
  }
});

module.exports = router;
