const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  claimGuestOrder,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, strictAuthLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone')
      .optional({ checkFalsy: true })
      .isMobilePhone('en-IN')
      .withMessage('Invalid phone number'),
  ],
  validate,
  register
);

router.post(
  '/login',
  strictAuthLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/claim-order', protect, claimGuestOrder);

module.exports = router;
