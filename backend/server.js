/**
 * EcoTradex Backend Server
 * Serves static frontend files, content API, admin API, and form handling
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const contactRoutes = require('./routes/contact');
const sampleRoutes = require('./routes/sample-request');
const quoteRoutes = require('./routes/quote');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_2
  ]
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve admin dashboard
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/sample-request', sampleRoutes);
app.use('/api/quote', quoteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ensure directories exist
['submissions', 'data'].forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

const uploadsDir = path.join(__dirname, '../frontend/assets/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.listen(PORT, () => {
  console.log(`\n  🌿 EcoTradex Server running at http://localhost:${PORT}`);
  console.log(`  🔐 Admin Dashboard at http://localhost:${PORT}/admin\n`);
});
