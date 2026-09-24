const express = require('express');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const { handleImageUpload } = require('../controllers/uploadController');
const { validateImage } = require('../middleware/imageValidator');
const {
  getDashboardStats,
  getAllCustomers,
  getCustomerById,
  getSettings,
  updateSettings,
  adminGetProducts,
  duplicateProduct,
  updateAdminPassword,
} = require('../controllers/adminController');
const {
  refundPayment,
  getAllPayments,
  getPaymentDetails,
} = require('../controllers/paymentController');
const {
  getAdminShowcase,
  setShowcaseSlotImage,
  removeShowcaseSlotImage,
  setShowcaseSlotDescription,
  setShowcaseSlotDetails,
  getSlotSubMaterials,
  setSubMaterialDetails,
  setSubMaterialImage,
} = require('../controllers/showcaseController');

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/customers', protect, admin, getAllCustomers);
router.get('/customers/:id', protect, admin, getCustomerById);
router.get('/products', protect, admin, adminGetProducts);
router.post('/products/:id/duplicate', protect, admin, duplicateProduct);
router.get('/settings', protect, admin, getSettings);
router.put('/settings', protect, admin, updateSettings);
router.post('/update-password', protect, admin, updateAdminPassword);
router.post('/upload', protect, admin, upload.single('image'), validateImage, handleImageUpload);

router.get('/showcase', protect, admin, getAdminShowcase);
router.put(
  '/showcase/slots/:slot/image',
  protect,
  admin,
  upload.single('image'),
  validateImage,
  setShowcaseSlotImage
);
router.delete('/showcase/slots/:slot/image', protect, admin, removeShowcaseSlotImage);
router.patch(
  '/showcase/slots/:slot/description',
  protect,
  admin,
  setShowcaseSlotDescription
);
router.put('/showcase/slots/:slot', protect, admin, setShowcaseSlotDetails);

router.get('/showcase/submaterials/:slot', protect, admin, getSlotSubMaterials);
router.put('/showcase/submaterials/:slot/:sub', protect, admin, setSubMaterialDetails);
router.put(
  '/showcase/submaterials/:slot/:sub/image',
  protect,
  admin,
  upload.single('image'),
  validateImage,
  setSubMaterialImage
);

router.get('/payments', protect, admin, getAllPayments);
router.get('/payments/:orderId', protect, admin, getPaymentDetails);
router.post('/payments/:orderId/refund', protect, admin, refundPayment);

module.exports = router;
