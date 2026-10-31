// const express = require("express");
// const router = express.Router();

// const brandController = require("../controllers/brandController");

// router.post("/", brandController.createBrand);

// router.get("/", brandController.getAllBrands);

// router.get("/:id", brandController.getBrandById);

// router.put("/:id", brandController.updateBrand);

// router.delete("/:id", brandController.deleteBrand);

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const brandController = require('../controllers/brandController');

// // Public routes
// router.get('/', brandController.getAllBrands);
// router.get('/with-count', brandController.getBrandsWithProductCount);
// router.get('/:id', brandController.getBrandById);

// // Protected routes (Admin only - add auth middleware as needed)
// router.post('/', brandController.createBrand);
// router.put('/:id', brandController.updateBrand);
// router.delete('/:id', brandController.deleteBrand);

// module.exports = router;



const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get('/', brandController.getAllBrands);
router.get('/with-count', brandController.getBrandsWithProductCount);
router.get('/:id', brandController.getBrandById);
router.get('/:id/products', brandController.getBrandProducts);

// ============================================
// ADMIN ROUTES (Authentication + Admin required)
// ============================================
// Get all brands including inactive ones (Admin only)
router.get('/admin/all', protect, admin, brandController.getAllBrandsAdmin);

// Create a new brand (Admin only)
router.post('/', protect, admin, brandController.createBrand);

// Update a brand (Admin only)
router.put('/:id', protect, admin, brandController.updateBrand);

// Delete a brand (Admin only)
router.delete('/:id', protect, admin, brandController.deleteBrand);

// Toggle brand active status (Admin only)
router.patch('/:id/toggle', protect, admin, brandController.toggleBrandStatus);

module.exports = router;