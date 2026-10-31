const OrderRepository = require('../repositories/orderRepository');

class OrderController {
  // Create new order
  static async createOrder(req, res) {
    try {
      const {
        fullName,
        email,
        phone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingPhone,
        paymentMethod,
        items
      } = req.body;

      // Validate required fields
      if (!fullName || !email || !phone || !shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Please fill all required fields'
        });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No items in order'
        });
      }

      // Validate stock for each item
      for (const item of items) {
        const product = await OrderRepository.getProductById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.productId} not found`
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available for ${product.name}`
          });
        }
      }

      // Calculate total
      const total = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // Create order
      const order = await OrderRepository.createOrder({
        userId: req.user ? req.user.id : null,
        fullName,
        email,
        phone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingPhone,
        total,
        paymentMethod
      });

      // Create order items
      await OrderRepository.createOrderItems(order.id, items);

      // Update product stock
      for (const item of items) {
        await OrderRepository.updateProductStock(item.productId, -item.quantity);
      }

      // Get complete order details
      const completeOrder = await OrderRepository.getOrderById(order.id);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
          orderId: completeOrder.id,
          orderNumber: completeOrder.orderNumber,
          trackingNumber: completeOrder.trackingNumber,
          status: completeOrder.status,
          total: completeOrder.total,
          createdAt: completeOrder.createdAt
        }
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;
      const isAdmin = req.user ? req.user.role === 'admin' : false;

      const order = await OrderRepository.getOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check authorization
      if (!isAdmin && order.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this order'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Track order by tracking number
  static async trackOrder(req, res) {
    try {
      const { trackingNumber } = req.params;
      const order = await OrderRepository.getOrderByTrackingNumber(trackingNumber);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: {
          orderNumber: order.orderNumber,
          trackingNumber: order.trackingNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          statusHistory: order.statusHistory,
          items: order.OrderItems,
          shippingAddress: order.shippingAddress,
          shippingCity: order.shippingCity,
          shippingState: order.shippingState
        }
      });
    } catch (error) {
      console.error('Track order error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user orders
  static async getUserOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await OrderRepository.getOrdersByUserId(req.user.id, page, limit);

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          page: result.page,
          limit: limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all orders (admin only)
  static async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await OrderRepository.getAllOrders(page, limit, filters);

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          page: result.page,
          limit: limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order status (admin only)
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const order = await OrderRepository.updateOrderStatus(id, status, note);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cancel order
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;

      const order = await OrderRepository.cancelOrder(id, userId);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete order (admin only)
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      await OrderRepository.deleteOrder(id);

      res.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order statistics
  static async getOrderStatistics(req, res) {
    try {
      const userId = req.user.role === 'admin' ? null : req.user.id;
      const stats = await OrderRepository.getOrderStatistics(userId);

      const formattedStats = {};
      stats.forEach(stat => {
        formattedStats[stat.status] = {
          count: parseInt(stat.dataValues.count),
          total: parseFloat(stat.dataValues.total) || 0
        };
      });

      res.json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      console.error('Get order statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = OrderController;