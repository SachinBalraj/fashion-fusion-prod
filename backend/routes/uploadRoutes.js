const express = require('express');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const { validateImage } = require('../middleware/imageValidator');
const { handleImageUpload, handleImageDelete } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), validateImage, handleImageUpload);
router.delete('/:id', protect, admin, handleImageDelete);

module.exports = router;