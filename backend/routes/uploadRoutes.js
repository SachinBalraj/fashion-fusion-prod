const express = require('express');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;
