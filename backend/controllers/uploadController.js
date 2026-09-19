const fs = require('fs');
const path = require('path');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

const handleImageUpload = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadImage(req.file.buffer.toString('base64'), 'fashion-fusion');
      if (!result || !result.secure_url) {
        return res.status(500).json({ message: 'Image upload failed' });
      }
      return res.status(201).json({
        message: 'File uploaded successfully',
        path: result.secure_url,
        publicId: result.public_id,
        cloudinary: true,
      });
    }

    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(req.file.originalname);
    fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    return res.status(201).json({
      message: 'File uploaded successfully',
      filename,
      path: `/uploads/${filename}`,
      cloudinary: false,
    });
  } catch (error) {
    console.error('[UPLOAD] Upload failed:', error.message);
    return res.status(500).json({ message: 'Image upload failed' });
  }
};

const handleImageDelete = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ message: 'publicId is required' });
    }
    await deleteImage(publicId);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('[UPLOAD] Delete failed:', error.message);
    res.status(500).json({ message: 'Image deletion failed' });
  }
};

module.exports = { handleImageUpload, handleImageDelete };