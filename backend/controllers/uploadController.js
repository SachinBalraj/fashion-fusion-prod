const mongoose = require('mongoose');
const { GRIDFS_PREFIX, uploadImage, deleteFile } = require('../services/gridfsService');

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const detected = req.file.imageType;
    if (!detected) {
      return res.status(400).json({
        message: 'Invalid image file. Only JPEG, PNG or WEBP images are allowed.',
      });
    }

    const fileId = await uploadImage({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      contentType: detected.mime,
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      path: `${GRIDFS_PREFIX}${fileId}`,
      fileId: String(fileId),
      gridfs: true,
    });
  } catch (error) {
    console.error('[UPLOAD] Upload failed:', error.message);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Image upload failed' });
  }
};

const handleImageDelete = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid image id' });
    }
    await deleteFile(new mongoose.Types.ObjectId(id));
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (/not found|does not exist/i.test(error.message)) {
      return res.status(404).json({ message: 'Image not found' });
    }
    console.error('[UPLOAD] Delete failed:', error.message);
    res.status(500).json({ message: 'Image deletion failed' });
  }
};

module.exports = { handleImageUpload, handleImageDelete };