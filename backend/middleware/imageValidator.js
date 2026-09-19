const { detectImageType } = require('../services/gridfsService');

const validateImage = (req, res, next) => {
  if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (req.file.buffer.length > 4 * 1024 * 1024) {
    return res.status(413).json({ message: 'Image must be 4 MB or smaller' });
  }

  const detected = detectImageType(req.file.buffer);
  if (!detected) {
    return res.status(400).json({
      message: 'Invalid image file. Only JPEG, PNG or WEBP images are allowed.',
    });
  }

  req.file.imageType = detected;
  next();
};

module.exports = { validateImage };