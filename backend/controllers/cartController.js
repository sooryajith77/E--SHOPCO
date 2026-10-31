const { Cart, CartItem, Product } = require('../models');

// Get user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, total: 0 });
    }
    
    res.json({
      success: true,
      items: cart.items || [],
      totalAmount: parseFloat(cart.total) || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  const transaction = await Cart.sequelize.transaction();
  
  try {
    const { productId, quantity = 1, size, color } = req.body;
    
    let cart = await Cart.findOne({ where: { userId: req.user.id }, transaction });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, total: 0 }, { transaction });
    }
    
    const product = await Product.findByPk(productId);
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
      transaction
    });
    
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save({ transaction });
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
        size,
        color
      }, { transaction });
    }
    
    // Update cart total
    const items = await CartItem.findAll({ where: { cartId: cart.id }, transaction });
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    cart.total = total;
    await cart.save({ transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Added to cart',
      cartItem
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    const cartItem = await CartItem.findByPk(itemId);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    cartItem.quantity = quantity;
    await cartItem.save();
    
    // Update cart total
    const cart = await Cart.findByPk(cartItem.cartId);
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    cart.total = total;
    await cart.save();
    
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cartItem = await CartItem.findByPk(itemId);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    await cartItem.destroy();
    
    // Update cart total
    const cart = await Cart.findByPk(cartItem.cartId);
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    cart.total = total;
    await cart.save();
    
    res.json({ success: true, message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
      cart.total = 0;
      await cart.save();
    }
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };