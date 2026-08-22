const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAddresses)
  .post(addAddress);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

router.put('/:id/default', setDefaultAddress);

module.exports = router;
