

// // controllers/adminController.js
// const { User, Product, Order, OrderItem } = require('../models');
// const { Op } = require('sequelize');
// const bcrypt = require('bcryptjs');

// // ==================== USER CONTROLLERS ====================

// // @desc    Get all users
// // @route   GET /api/admin/users
// const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.findAll({
//             attributes: { exclude: ['password'] },
//             order: [['createdAt', 'DESC']]
//         });
        
//         // Get order count for each user
//         const usersWithOrderCount = await Promise.all(
//             users.map(async (user) => {
//                 const orderCount = await Order.count({ where: { userId: user.id } });
//                 return {
//                     ...user.toJSON(),
//                     orderCount
//                 };
//             })
//         );
        
//         res.json(usersWithOrderCount);
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // @desc    Get user by ID
// // @route   GET /api/admin/users/:id
// const getUserById = async (req, res) => {
//     try {
//         const user = await User.findByPk(req.params.id, {
//             attributes: { exclude: ['password'] }
//         });
        
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
        
//         res.json(user);
//     } catch (error) {
//         console.error('Error fetching user:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // @desc    Update user
// // @route   PUT /api/admin/users/:id
// const updateUser = async (req, res) => {
//     try {
//         const user = await User.findByPk(req.params.id);
        
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
        
//         const { name, email, role, password } = req.body;
        
//         if (name) user.name = name;
//         if (email) user.email = email;
//         if (role) user.role = role;
//         if (password) {
//             user.password = await bcrypt.hash(password, 10);
//         }
        
//         await user.save();
        
//         const { password: _, ...userWithoutPassword } = user.toJSON();
//         res.json(userWithoutPassword);
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // @desc    Delete user
// // @route   DELETE /api/admin/users/:id
// const deleteUser = async (req, res) => {
//     try {
//         const user = await User.findByPk(req.params.id);
        
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
        
//         // Prevent deleting the last admin
//         if (user.role === 'admin') {
//             const adminCount = await User.count({ where: { role: 'admin' } });
//             if (adminCount <= 1) {
//                 return res.status(400).json({ error: 'Cannot delete the only admin user' });
//             }
//         }
        
//         await user.destroy();
//         res.json({ message: 'User deleted successfully', id: req.params.id });
//     } catch (error) {
//         console.error('Error deleting user:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ==================== PRODUCT CONTROLLERS ====================

// // @desc    Get all products
// // @route   GET /api/admin/products
// const getAllProducts = async (req, res) => {
//     try {
//         const products = await Product.findAll({
//             order: [['createdAt', 'DESC']]
//         });
//         console.log(`Fetched ${products.length} products`);
//         res.json(products);
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // @desc    Create product
// // @route   POST /api/admin/products
// const createProduct = async (req, res) => {
//     try {
//         console.log('Received product data:', req.body);
        
//         const { title, price, description, category, image, stock } = req.body;
        
//         // Validation
//         if (!title || !price || !description || !category || !image) {
//             return res.status(400).json({ error: 'All fields are required' });
//         }
        
//         const product = await Product.create({
//             title,
//             price: parseFloat(price),
//             description,
//             category,
//             image,
//             stock: stock || 100,
//             rating: { rate: 0, count: 0 }
//         });
        
//         console.log('Product created successfully:', product.id);
//         res.status(201).json(product);
//     } catch (error) {
//         console.error('Error creating product:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // @desc    Update product
// // @route   PUT /api/admin/products/:id
// const updateProduct = async (req, res) => {
//     try {
//         const product = await Product.findByPk(req.params.id);
        
//         if (!product) {
//             return res.status(404).json({ error: 'Product not found' });
//         }
        
//         const { title, price, description, category, image, stock } = req.body;
        
//         await product.update({
//             title: title || product.title,
//             price: price !== undefined ? parseFloat(price) : product.price,
//             description: description || product.description,
//             category: category || product.category,
//             image: image || product.image,
//             stock: stock !== undefined ? parseInt(stock) : product.stock
//         });
        
//         console.log('Product updated successfully:', product.id);
//         res.json(product);
//     } catch (error) {
//         console.error('Error updating product:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // @desc    Delete product
// // @route   DELETE /api/admin/products/:id
// const deleteProduct = async (req, res) => {
//     try {
//         const product = await Product.findByPk(req.params.id);
        
//         if (!product) {
//             return res.status(404).json({ error: 'Product not found' });
//         }
        
//         await product.destroy();
//         console.log('Product deleted successfully:', req.params.id);
//         res.json({ message: 'Product deleted successfully', id: req.params.id });
//     } catch (error) {
//         console.error('Error deleting product:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ==================== ORDER CONTROLLERS ====================

// // @desc    Get all orders
// // @route   GET /api/admin/orders
// const getAllOrders = async (req, res) => {
//     try {
//         const orders = await Order.findAll({
//             include: [
//                 {
//                     model: User,
//                     as: 'user',
//                     attributes: ['id', 'name', 'email']
//                 },
//                 {
//                     model: OrderItem,
//                     as: 'items',
//                     include: [{
//                         model: Product,
//                         as: 'product',
//                         attributes: ['id', 'title', 'image']
//                     }]
//                 }
//             ],
//             order: [['createdAt', 'DESC']]
//         });
        
//         // Format orders for frontend
//         const formattedOrders = orders.map(order => ({
//             id: order.id,
//             customer: order.user ? order.user.name : 'Guest',
//             email: order.user ? order.user.email : 'guest@example.com',
//             total: parseFloat(order.total),
//             status: order.status,
//             items: order.items ? order.items.length : 0,
//             createdAt: order.createdAt,
//             User: order.user,
//             OrderItems: order.items
//         }));
        
//         res.json(formattedOrders);
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // @desc    Update order status
// // @route   PUT /api/admin/orders/:id/status
// const updateOrderStatus = async (req, res) => {
//     try {
//         const { status } = req.body;
//         const order = await Order.findByPk(req.params.id);
        
//         if (!order) {
//             return res.status(404).json({ error: 'Order not found' });
//         }
        
//         const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
//         if (!validStatuses.includes(status)) {
//             return res.status(400).json({ error: 'Invalid status' });
//         }
        
//         await order.update({ status });
//         console.log('Order status updated:', order.id, status);
//         res.json(order);
//     } catch (error) {
//         console.error('Error updating order status:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // @desc    Delete order
// // @route   DELETE /api/admin/orders/:id
// const deleteOrder = async (req, res) => {
//     try {
//         const order = await Order.findByPk(req.params.id);
        
//         if (!order) {
//             return res.status(404).json({ error: 'Order not found' });
//         }
        
//         await order.destroy();
//         console.log('Order deleted successfully:', req.params.id);
//         res.json({ message: 'Order deleted successfully', id: req.params.id });
//     } catch (error) {
//         console.error('Error deleting order:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ==================== DASHBOARD CONTROLLERS ====================

// // @desc    Get dashboard stats
// // @route   GET /api/admin/dashboard/stats
// const getDashboardStats = async (req, res) => {
//     try {
//         const totalUsers = await User.count();
//         const totalProducts = await Product.count();
//         const totalOrders = await Order.count();
        
//         const deliveredOrders = await Order.findAll({
//             where: { status: 'delivered' },
//             attributes: ['total']
//         });
        
//         const totalRevenue = deliveredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        
//         const recentOrders = await Order.findAll({
//             limit: 5,
//             order: [['createdAt', 'DESC']],
//             include: [{ model: User, as: 'user', attributes: ['name'] }]
//         });
        
//         res.json({
//             totalUsers,
//             totalProducts,
//             totalOrders,
//             totalRevenue,
//             recentOrders
//         });
//     } catch (error) {
//         console.error('Error fetching dashboard stats:', error);
//         res.status(500).json({ error: error.message });
//     }
// };
// // ==================== ADD THESE MISSING FUNCTIONS ====================

// // @desc    Update user role (alias for updateUser for compatibility)
// // @route   PUT /api/admin/users/:id/role
// const updateUserRole = async (req, res) => {
//     try {
//         const user = await User.findByPk(req.params.id);
        
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
        
//         const { role } = req.body;
        
//         if (!role || !['user', 'admin'].includes(role)) {
//             return res.status(400).json({ error: 'Invalid role' });
//         }
        
//         // Prevent changing the last admin
//         if (user.role === 'admin' && role !== 'admin') {
//             const adminCount = await User.count({ where: { role: 'admin' } });
//             if (adminCount <= 1) {
//                 return res.status(400).json({ error: 'Cannot demote the only admin user' });
//             }
//         }
        
//         user.role = role;
//         await user.save();
        
//         const { password, ...userWithoutPassword } = user.toJSON();
//         res.json(userWithoutPassword);
//     } catch (error) {
//         console.error('Error updating user role:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ==================== BRAND CONTROLLERS ====================

// // @desc    Get all brands
// // @route   GET /api/admin/brands
// const getBrands = async (req, res) => {
//     try {
//         // If Brand model doesn't exist yet, return empty array
//         let brands = [];
//         try {
//             const { Brand } = require('../models');
//             if (Brand) {
//                 brands = await Brand.findAll({
//                     order: [['name', 'ASC']]
//                 });
//             }
//         } catch (err) {
//             console.log('Brand model not yet available');
//         }
        
//         res.json(brands);
//     } catch (error) {
//         console.error('Error fetching brands:', error);
//         res.json([]); // Return empty array instead of error
//     }
// };

// // @desc    Create brand
// // @route   POST /api/admin/brands
// const createBrand = async (req, res) => {
//     try {
//         const { name, logo, description } = req.body;
        
//         if (!name) {
//             return res.status(400).json({ error: 'Brand name is required' });
//         }
        
//         // Check if Brand model exists
//         let Brand;
//         try {
//             Brand = require('../models').Brand;
//         } catch (err) {
//             // If Brand model doesn't exist, create a simple response
//             return res.status(201).json({ 
//                 id: Date.now(),
//                 name,
//                 logo,
//                 description,
//                 message: 'Brand created (model not yet available)'
//             });
//         }
        
//         const brand = await Brand.create({ name, logo, description });
//         res.status(201).json(brand);
//     } catch (error) {
//         console.error('Error creating brand:', error);
//         res.status(500).json({ error: error.message });
//     }
// };
// module.exports = {
//     // User functions
//     getAllUsers,
//     getUserById,
//     updateUser,
//     deleteUser,
//     updateUserRole,  // Added
    
//     // Product functions
//     getAllProducts,
//     createProduct,
//     updateProduct,
//     deleteProduct,
    
//     // Order functions
//     getAllOrders,
//     updateOrderStatus,
//     deleteOrder,
    
//     // Dashboard
//     getDashboardStats,
    
//     // Brand functions (temporary - return empty)
//     getBrands,      // Added
//     createBrand     // Added
// };




const { User, Product, Order, OrderItem } = require("../models");
const bcrypt = require("bcryptjs");

// ================= USER =================

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get one user
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, email, role, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const { password: removedPassword, ...userData } = user.toJSON();

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
      });
    }

    user.role = role;

    await user.save();

    const { password, ...userData } = user.toJSON();

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= PRODUCT =================

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      category,
      image,
      stock,
    } = req.body;

    if (!title || !price || !description || !category || !image) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const product = await Product.create({
      title,
      price,
      description,
      category,
      image,
      stock: stock || 100,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    await product.update(req.body);

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    await product.destroy();

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= ORDER =================

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "image"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    order.status = status;

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    await order.destroy();

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= DASHBOARD =================

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= EXPORT =================

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,

  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,

  getAllOrders,
  updateOrderStatus,
  deleteOrder,

  getDashboardStats,
};