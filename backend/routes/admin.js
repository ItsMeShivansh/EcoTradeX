/**
 * Admin API — Protected endpoints for managing all site content
 * Auth: passcode-based (jeelshivansh@#1107)
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const SiteContent = require('../models/SiteContent');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '../../frontend/assets/uploads');
const ADMIN_PASSCODE = 'jeelshivansh@#1107';

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
}});

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_PASSCODE) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Apply auth to all admin routes
router.use(requireAuth);

// ── Site Content CRUD ──

// GET all content
router.get('/content', async (req, res) => {
  try { res.json(await SiteContent.get()); } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT update a section
router.put('/content/:section', async (req, res) => {
  try {
    const content = await SiteContent.get();
    content[req.params.section] = req.body;
    await SiteContent.updateAll(content);
    res.json({ success: true, section: req.params.section });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PATCH update a field within a section
router.patch('/content/:section', async (req, res) => {
  try {
    await SiteContent.updateSection(req.params.section, req.body);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Products CRUD ──

router.get('/products', async (req, res) => {
  try { res.json(await Product.getAll()); } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/products', async (req, res) => {
  try { await Product.updateAll(req.body); res.json({ success: true }); } catch(e) { res.status(500).json({ error: e.message }); }
});

// Update single product
router.put('/products/:category/:id', async (req, res) => {
  try {
    const product = await Product.updateProduct(req.params.category, req.params.id, req.body);
    res.json({ success: true, product });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Add product
router.post('/products/:category', async (req, res) => {
  try {
    await Product.addProduct(req.params.category, req.body);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Delete product
router.delete('/products/:category/:id', async (req, res) => {
  try {
    await Product.deleteProduct(req.params.category, req.params.id);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── FAQs CRUD ──

router.get('/faqs', async (req, res) => {
  try { const c = await SiteContent.get(); res.json(c.faqs || []); } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/faqs', async (req, res) => {
  try {
    await SiteContent.addToArray('faqs', req.body);
    const content = await SiteContent.get();
    res.json({ success: true, faqs: content.faqs });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/faqs/:index', async (req, res) => {
  try {
    await SiteContent.updateArrayItem('faqs', parseInt(req.params.index), req.body);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/faqs/:index', async (req, res) => {
  try {
    await SiteContent.removeFromArray('faqs', parseInt(req.params.index));
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Image Upload ──

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/assets/uploads/${req.file.filename}`;
  res.json({ success: true, url, filename: req.file.filename });
});

// Update an image reference in site content
router.put('/images/:key', async (req, res) => {
  try {
    await SiteContent.updateImageRef(req.body.key || req.params.key, req.body.url);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// List all uploaded images
router.get('/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    res.json({ success: true, files });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Inquiries ──
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.getAll();
    res.json({ success: true, inquiries });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Auth Check ──
router.get('/verify', (req, res) => {
  res.json({ authenticated: true });
});

module.exports = router;
