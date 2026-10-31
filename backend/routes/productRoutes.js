// const express = require('express');
// const router = express.Router();
// const {
//     getAllProducts,
//     getProductById,
//     getProductsByCategory,
//     getAllCategories,
//     createProduct,
//     updateProduct,
//     deleteProduct,
//     checkProductStock
// } = require('../controllers/productController');
// const { protect, admin } = require('../middleware/authMiddleware');

// // Public routes
// router.get('/', getAllProducts);
// router.get('/categories/all', getAllCategories);
// router.get('/category/:category', getProductsByCategory);
// router.get('/:id/stock', checkProductStock);
// router.get('/:id', getProductById);

// // Admin only routes
// router.post('/', protect, admin, createProduct);
// router.put('/:id', protect, admin, updateProduct);
// router.delete('/:id', protect, admin, deleteProduct);

// module.exports = router;




// const express = require('express');
// const {
//   getProducts,
//   getProductById,
//   getProductsByCategory,
//   getCategories,
//   getNewArrivals,
//   getOnSale
// } = require('../controllers/productController');

// const router = express.Router();

// router.get('/', getProducts);
// router.get('/categories', getCategories);
// router.get('/new-arrivals', getNewArrivals);
// router.get('/on-sale', getOnSale);
// router.get('/category/:category', getProductsByCategory);
// router.get('/:id', getProductById);

// module.exports = router;



// const express = require('express');
// const {
//   getProducts,
//   getProductById,
//   getProductsByCategory,
//   getProductsByCategories,  // Add this new function
//   getCategories,
//   getNewArrivals,
//   getOnSale
// } = require('../controllers/productController');

// const router = express.Router();

// router.get('/', getProducts);
// router.get('/categories', getCategories);
// router.get('/new-arrivals', getNewArrivals);
// router.get('/on-sale', getOnSale);
// router.get('/category/:category', getProductsByCategory);
// router.get('/similar/products', getProductsByCategories);  // New route for similar products
// router.get('/:id', getProductById);

// module.exports = router;




const express = require('express');
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  getProductsByCategories,
  getCategories,
  getNewArrivals,
  getOnSale,
  // Admin functions
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByBrand,
  bulkCreateProducts,
  updateProductStock
} = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/new-arrivals', getNewArrivals);
router.get('/on-sale', getOnSale);
router.get('/category/:category', getProductsByCategory);
router.get('/similar/products', getProductsByCategories);
router.get('/:id', getProductById);

// ============================================
// ADMIN ROUTES (Authentication + Admin required)
// ============================================
// Create a product (Admin only)
router.post('/', protect, admin, createProduct);

// Bulk create products (Admin only)
router.post('/bulk', protect, admin, bulkCreateProducts);

// Update a product (Admin only)
router.put('/:id', protect, admin, updateProduct);

// Update product stock (Admin only)
router.put('/:id/stock', protect, admin, updateProductStock);

// Delete a product (Admin only)
router.delete('/:id', protect, admin, deleteProduct);

// Get products by brand (Admin only)
router.get('/brand/:brandId', protect, admin, getProductsByBrand);

module.exports = router;