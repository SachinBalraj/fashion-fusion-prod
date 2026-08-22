const express = require('express');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllCustomers,
  getCustomerById,
  getSettings,
  updateSettings,
  adminGetProducts,
  duplicateProduct,
} = require('../controllers/adminController');
const {
  refundPayment,
  getAllPayments,
  getPaymentDetails,
} = require('../controllers/paymentController');

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/customers', protect, admin, getAllCustomers);
router.get('/customers/:id', protect, admin, getCustomerById);
router.get('/products', protect, admin, adminGetProducts);
router.post('/products/:id/duplicate', protect, admin, duplicateProduct);
router.get('/settings', protect, admin, getSettings);
router.put('/settings', protect, admin, updateSettings);
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

router.get('/payments', protect, admin, getAllPayments);
router.get('/payments/:orderId', protect, admin, getPaymentDetails);
router.post('/payments/:orderId/refund', protect, admin, refundPayment);

module.exports = router;
