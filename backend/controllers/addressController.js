const { UserAddress } = require('../models');

// Get all addresses for a user
const getAddresses = async (req, res) => {
  try {
    const addresses = await UserAddress.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get default address
const getDefaultAddress = async (req, res) => {
  try {
    const address = await UserAddress.findOne({
      where: { userId: req.user.id, isDefault: true }
    });
    
    res.json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new address
const createAddress = async (req, res) => {
  try {
    const { fullName, email, phone, address, city, state, zipCode, isDefault, addressType } = req.body;
    
    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await UserAddress.update(
        { isDefault: false },
        { where: { userId: req.user.id } }
      );
    }
    
    const newAddress = await UserAddress.create({
      userId: req.user.id,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      isDefault: isDefault || false,
      addressType: addressType || 'home'
    });
    
    res.status(201).json({
      success: true,
      address: newAddress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, address, city, state, zipCode, isDefault, addressType } = req.body;
    
    const userAddress = await UserAddress.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!userAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    
    // If this is set as default, remove default from other addresses
    if (isDefault && !userAddress.isDefault) {
      await UserAddress.update(
        { isDefault: false },
        { where: { userId: req.user.id } }
      );
    }
    
    await userAddress.update({
      fullName: fullName || userAddress.fullName,
      email: email || userAddress.email,
      phone: phone || userAddress.phone,
      address: address || userAddress.address,
      city: city || userAddress.city,
      state: state || userAddress.state,
      zipCode: zipCode || userAddress.zipCode,
      isDefault: isDefault !== undefined ? isDefault : userAddress.isDefault,
      addressType: addressType || userAddress.addressType
    });
    
    res.json({
      success: true,
      address: userAddress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userAddress = await UserAddress.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!userAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    
    await userAddress.destroy();
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set address as default
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Remove default from all addresses
    await UserAddress.update(
      { isDefault: false },
      { where: { userId: req.user.id } }
    );
    
    // Set new default
    const address = await UserAddress.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    
    address.isDefault = true;
    await address.save();
    
    res.json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};