// const express = require('express');
// const router = express.Router();
// const OrderController = require('../controllers/orderController');
// const { protect, admin } = require('../middleware/authMiddleware');

// // Public routes (no authentication required)
// router.post('/', OrderController.createOrder);
// router.get('/track/:trackingNumber', OrderController.trackOrder);

// // User routes (authentication required)
// router.get('/my-orders', protect, OrderController.getUserOrders);
// router.get('/my-stats', protect, OrderController.getOrderStatistics);
// router.put('/:id/cancel', protect, OrderController.cancelOrder);
// router.get('/:id', protect, OrderController.getOrderById);

// // Admin routes (authentication + admin role required)
// router.get('/admin/all', protect, admin, OrderController.getAllOrders);
// router.put('/admin/:id/status', protect, admin, OrderController.updateOrderStatus);
// router.delete('/admin/:id', protect, admin, OrderController.deleteOrder);
// router.get('/admin/stats/all', protect, admin, OrderController.getAllOrderStatistics);

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const OrderController = require('../controllers/orderController');
// const { protect, admin } = require('../middleware/authMiddleware');

// // Public routes
// router.post('/', OrderController.createOrder);
// router.get('/track/:trackingNumber', OrderController.trackOrder);

// // User routes (authenticated)
// router.get('/my-orders', protect, OrderController.getUserOrders);
// router.get('/my-stats', protect, OrderController.getOrderStatistics);
// router.put('/:id/cancel', protect, OrderController.cancelOrder);
// router.get('/:id', protect, OrderController.getOrderById);

// // ============ ADMIN ROUTES ============
// // Get all orders (with pagination, filtering)
// router.get('/admin/all', protect, admin, OrderController.getAllOrders);

// // Get admin dashboard stats
// router.get('/admin/dashboard/stats', protect, admin, OrderController.getDashboardStats);

// // Update order status
// router.put('/admin/orders/:id/status', protect, admin, OrderController.updateOrderStatus);

// // Delete order
// router.delete('/admin/orders/:id', protect, admin, OrderController.deleteOrder);

// // Get all orders for admin (simpler version)
// router.get('/admin/orders', protect, admin, OrderController.getAdminOrders);

// module.exports = router;










const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderByTrackingId,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/track/:trackingId', getOrderByTrackingId);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;