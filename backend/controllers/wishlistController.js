const { Wishlist, Product } = require('../models');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product' }]
    });
    
    res.json(wishlist.map(w => w.product));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const existing = await Wishlist.findOne({
      where: { userId: req.user.id, productId }
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    
    await Wishlist.create({
      userId: req.user.id,
      productId
    });
    
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    await Wishlist.destroy({
      where: { userId: req.user.id, productId }
    });
    
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };