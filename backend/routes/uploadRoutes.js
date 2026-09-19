const express = require('express');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const { handleImageUpload } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), handleImageUpload);

module.exports = router;
