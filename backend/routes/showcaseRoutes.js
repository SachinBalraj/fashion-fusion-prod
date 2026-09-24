const express = require('express');
const { getCollectionBySlug } = require('../controllers/showcaseController');

const router = express.Router();

router.get('/:slug', getCollectionBySlug);

module.exports = router;