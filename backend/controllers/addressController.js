const User = require('../models/User');

const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json(user.addresses || []);
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const { street, city, state, zip, country, label, isDefault } = req.body;

    if (!street || !city || !state || !zip) {
      return res.status(400).json({ message: 'Street, city, state, and pincode are required' });
    }

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    const newAddress = {
      street,
      city,
      state,
      zip,
      country: country || 'India',
      label: label || 'Home',
      isDefault: isDefault || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(user.addresses);
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const { street, city, state, zip, country, label, isDefault } = req.body;

    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (zip !== undefined) address.zip = zip;
    if (country !== undefined) address.country = country;
    if (label !== undefined) address.label = label;

    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
      address.isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.addresses.pull(req.params.id);

    if (address.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.addresses.forEach((addr) => { addr.isDefault = false; });
    address.isDefault = true;
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};