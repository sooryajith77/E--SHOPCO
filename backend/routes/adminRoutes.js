// const express = require('express');
// const { protect } = require('../middleware/authMiddleware');
// const { admin } = require('../middleware/adminMiddleware');
// const {
//     getAllUsers,
//     getUserById,
//     updateUser,
//     deleteUser,
//     getAllProducts,
//     createProduct,
//     updateProduct,
//     deleteProduct,
//     getAllOrders,
//     updateOrderStatus,
//     getDashboardStats
// } = require('../controllers/adminController');

// const router = express.Router();

// // All admin routes are protected
// router.use(protect);
// router.use(admin);

// // Users
// router.get('/users', getAllUsers);
// router.get('/users/:id', getUserById);
// router.put('/users/:id', updateUser);
// router.delete('/users/:id', deleteUser);

// // Products
// router.get('/products', getAllProducts);
// router.post('/products', createProduct);
// router.put('/products/:id', updateProduct);
// router.delete('/products/:id', deleteProduct);

// // Orders
// router.get('/orders', getAllOrders);
// router.put('/orders/:id/status', updateOrderStatus);

// // Dashboard
// router.get('/dashboard/stats', getDashboardStats);

// module.exports = router;


// // routes/adminRoutes.js
// const express = require('express');
// const { protect } = require('../middleware/authMiddleware');
// const { admin } = require('../middleware/adminMiddleware');
// const {
//     getAllUsers,
//     getUserById,
//     updateUser,
//     deleteUser,
//     getAllProducts,
//     createProduct,
//     updateProduct,
//     deleteProduct,
//     getAllOrders,
//     updateOrderStatus,
//     deleteOrder,
//     getDashboardStats
// } = require('../controllers/adminController');
// console.log({
//     getAllUsers,
//     getUserById,
//     updateUser,
//     deleteUser,
//     getAllProducts,
//     createProduct,
//     updateProduct,
//     deleteProduct,
//     getAllOrders,
//     updateOrderStatus,
//     deleteOrder,
//     getDashboardStats
// });
// const router = express.Router();

// // All admin routes are protected
// router.use(protect);
// router.use(admin);

// // Users
// router.get('/users', getAllUsers);
// router.get('/users/:id', getUserById);
// router.put('/users/:id', updateUser);
// router.delete('/users/:id', deleteUser);

// // Products
// router.get('/products', getAllProducts);
// router.post('/products', createProduct);
// router.put('/products/:id', updateProduct);
// router.delete('/products/:id', deleteProduct);

// // Orders
// router.get('/orders', getAllOrders);
// router.put('/orders/:id/status', updateOrderStatus);
// router.delete('/orders/:id', deleteOrder);

// // Dashboard
// router.get('/dashboard/stats', getDashboardStats);

// module.exports = router;









const express = require('express');
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAllUsers,
  updateUserRole,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  createBrand
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
console.log({
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAllUsers,
  updateUserRole,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
 
});


const router = express.Router();

router.use(protect, admin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

// Products
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Brands


module.exports = router;