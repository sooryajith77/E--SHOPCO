

const { Order, OrderItem, Product, Cart, CartItem, User } = require('../models');
const { generateOrderId, generateTrackingId } = require('../utils/generateOrderId');
const { sequelize } = require('../models');

// Create order from cart OR direct items - with guest support
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      shippingAddress, 
      paymentMethod, 
      fullName, 
      email, 
      phone, 
      city, 
      state, 
      zipCode,
      items  // Get items directly from request body
    } = req.body;
    
    // Check if user is authenticated
    const isAuthenticated = req.user && req.user.id;
    const userId = isAuthenticated ? req.user.id : null;
    
    console.log('Creating order for user:', userId || 'Guest');
    console.log('Items received:', items);
    console.log('Customer info:', { fullName, email, phone });
    
    let orderItems = [];
    let total = 0;
    
    // Check if items are provided directly in request
    if (items && items.length > 0) {
      // Use items from request body (Buy Now from Product Detail page)
      orderItems = items;
      for (const item of items) {
        total += item.price * item.quantity;
      }
    } else if (isAuthenticated) {
      // Fallback to cart items for authenticated users
      const cart = await Cart.findOne({
        where: { userId: userId },
        include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
        transaction
      });
      
      if (!cart || !cart.items || cart.items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }
      
      orderItems = cart.items;
      total = cart.total;
      
      // Clear cart after order
      await CartItem.destroy({ where: { cartId: cart.id }, transaction });
      cart.total = 0;
      await cart.save({ transaction });
    } else {
      // Guest user with no items in request
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'No items in order' });
    }
    
    if (orderItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'No items in order' });
    }
    
    // Determine customer name
    let customerName = 'Guest';
    if (isAuthenticated && req.user.name) {
      customerName = req.user.name;
    } else if (fullName) {
      customerName = fullName;
    }
    
    // Determine email
    let customerEmail = null;
    if (isAuthenticated && req.user.email) {
      customerEmail = req.user.email;
    } else if (email) {
      customerEmail = email;
    }
    
    // Create order with guest support
    const orderData = {
      orderId: generateOrderId(),
      userId: userId,
      customerName: customerName,
      total: total,
      total_amount: total,
      status: 'pending',
      shippingAddress: shippingAddress || `${city || ''}, ${state || ''} ${zipCode || ''}`,
      paymentMethod: paymentMethod || 'cod',
      fullName: fullName || (isAuthenticated ? req.user.name : 'Guest'),
      email: customerEmail,
      phone: phone || '',
      city: city || '',
      state: state || '',
      zipCode: zipCode || '',
      trackingId: generateTrackingId(),
      tracking_number: generateTrackingId()
    };
    
    // If authenticated, also set shipping_name
    if (isAuthenticated) {
      orderData.shipping_name = req.user.name;
    }
    
    const order = await Order.create(orderData, { transaction });
    
    console.log('Order created:', order.id, 'for customer:', customerName);
    
    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size || 'Medium',
        color: item.color || 'Black'
      }, { transaction });
      
      // Update product stock
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction
      });
    }
    
    await transaction.commit();
    
    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      order: completeOrder,
      trackingId: order.trackingId,
      message: 'Order created successfully',
      isGuest: !isAuthenticated
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's orders - with guest support
const getUserOrders = async (req, res) => {
  try {
    // If authenticated, get user's orders
    if (req.user && req.user.id) {
      const orders = await Order.findAll({
        where: { userId: req.user.id },
        include: [
          { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`Found ${orders.length} orders for user ${req.user.id}`);
      
      return res.json({
        success: true,
        orders
      });
    }
    
    // For guest users, try to find orders by email from query params
    const { email } = req.query;
    if (email) {
      const orders = await Order.findAll({
        where: { email: email },
        include: [
          { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return res.json({
        success: true,
        orders
      });
    }
    
    // No user and no email
    res.json({
      success: true,
      orders: []
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order by tracking ID - public access
const getOrderByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    const order = await Order.findOne({
      where: { trackingId: trackingId },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    const isAuthorized = 
      req.user && 
      (req.user.id === order.userId || req.user.role === 'admin');
    
    // For guest orders, allow viewing by email match
    const emailMatch = order.email && req.query.email === order.email;
    
    if (!isAuthorized && !emailMatch) {
      // Return limited info for unauthorized users
      return res.json({
        success: true,
        order: {
          orderId: order.orderId,
          trackingId: order.trackingId,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          // Don't expose personal info
          items: order.items,
          // Exclude email, phone, address for unauthorized
        }
      });
    }
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel order - with guest support
const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const order = await Order.findByPk(req.params.id, { transaction });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check authorization: user owns order OR is admin
    const isAuthorized = 
      req.user && 
      (req.user.id === order.userId || req.user.role === 'admin');
    
    // For guest orders, check if email matches
    const emailMatch = order.email && req.body.email === order.email;
    
    if (!isAuthorized && !emailMatch) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }
    
    if (order.status !== 'pending' && order.status !== 'processing') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
    }
    
    order.status = 'cancelled';
    await order.save({ transaction });
    
    // Restore stock
    const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction });
    for (const item of items) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction
      });
    }
    
    await transaction.commit();
    
    res.json({ 
      success: true, 
      message: 'Order cancelled successfully',
      orderId: order.id,
      status: order.status
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order by ID - with guest support
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check authorization
    const isAuthorized = 
      req.user && 
      (req.user.id === order.userId || req.user.role === 'admin');
    
    // For guest orders, check if email matches
    const emailMatch = order.email && req.query.email === order.email;
    
    if (!isAuthorized && !emailMatch) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this order' 
      });
    }
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  createOrder, 
  getUserOrders, 
  getOrderByTrackingId, 
  cancelOrder,
  getOrderById
};