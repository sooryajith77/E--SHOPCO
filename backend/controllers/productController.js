
const { Product, Brand, sequelize } = require('../models');
const { Op } = require('sequelize');

const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      sort, 
      search,
      isNewArrival,
      isOnSale,
      limit = 100,
      page = 1
    } = req.query;
    
    let where = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (brand) {
      where.brandId = brand;
    }
    
    if (isNewArrival === 'true') {
      where.isNewArrival = true;
    }
    
    if (isOnSale === 'true') {
      where.isOnSale = true;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    let order = [];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'rating') order = [[sequelize.literal('rating->>\'rate\''), 'DESC']];
    if (sort === 'newest') order = [['createdAt', 'DESC']];
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [{ 
        model: Brand, 
        as: 'brand', 
        attributes: ['id', 'name', 'logo'] 
      }]
    });
    
    res.json({
      success: true,
      products,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findByPk(id, {
      include: [{ 
        model: Brand, 
        as: 'brand', 
        attributes: ['id', 'name', 'logo'] 
      }]
    });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 100, page = 1, sort } = req.query;
    
    const decodedCategory = decodeURIComponent(category);
    const searchTerm = decodedCategory.replace(/-/g, ' ').toLowerCase();
    
    let where = {
      [Op.or]: [
        {
          category: {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          dressStyle: {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          style: {
            [Op.iLike]: `%${searchTerm}%`
          }
        },
        {
          productCategory: {
            [Op.iLike]: `%${searchTerm}%`
          }
        }
      ]
    };
    
    let order = [];
    if (sort === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'rating') {
      order = [[sequelize.literal('CAST(rating->>\'rate\' AS FLOAT)'), 'DESC']];
    } else {
      order = [['createdAt', 'DESC']];
    }
    
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset,
      include: [{ 
        model: Brand, 
        as: 'brand', 
        attributes: ['id', 'name', 'logo'] 
      }]
    });
    
    res.json({
      success: true,
      products,
      count,
      category: decodedCategory,
      page: parseInt(page),
      totalPages: Math.ceil(count / limitNum),
      hasProducts: count > 0
    });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching products by category',
      error: error.message 
    });
  }
};

const getProductsByCategories = async (req, res) => {
  try {
    const { categories, excludeId, limit = 4 } = req.query;
    
    if (!categories) {
      return res.status(400).json({ 
        success: false, 
        message: 'Categories parameter required' 
      });
    }
    
    const categoryArray = categories.split(',');
    
    let where = {
      category: {
        [Op.in]: categoryArray
      }
    };
    
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    
    const products = await Product.findAll({
      where,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: Brand, 
        as: 'brand', 
        attributes: ['id', 'name', 'logo'] 
      }]
    });
    
    const shuffled = products.sort(() => 0.5 - Math.random());
    
    res.json({
      success: true,
      products: shuffled.slice(0, parseInt(limit)),
      count: shuffled.slice(0, parseInt(limit)).length
    });
  } catch (error) {
    console.error('Error in getProductsByCategories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching products by categories',
      error: error.message 
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: { category: { [Op.ne]: null } }
    });
    
    res.json({
      success: true,
      categories: categories.map(c => c.category).filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getNewArrivals = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.findAll({
      where: { isNewArrival: true },
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: Brand, 
        as: 'brand', 
        attributes: ['id', 'name', 'logo'] 
      }]
    });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getOnSale = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.findAll({
      where: { isOnSale: true },
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: Brand, 
        as: 'brand', 
        attributes: ['id', 'name', 'logo'] 
      }]
    });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching on sale products:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    delete productData.id;
    
    if (!productData.title || !productData.title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product title is required'
      });
    }
    
    if (!productData.price || productData.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid product price is required'
      });
    }
    
    if (productData.brandId) {
      const brand = await Brand.findByPk(productData.brandId);
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }
    
    Object.keys(productData).forEach(key => {
      if (productData[key] === null || productData[key] === undefined || productData[key] === '') {
        delete productData[key];
      }
    });
    
    if (!productData.stock) productData.stock = 100;
    
    const product = await Product.create(productData);
    
    const productWithBrand = await Product.findByPk(product.id, {
      include: [{
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name', 'logo']
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: productWithBrand
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    delete productData.id;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (productData.brandId) {
      const brand = await Brand.findByPk(productData.brandId);
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }
    }
    
    Object.keys(productData).forEach(key => {
      if (productData[key] === null || productData[key] === undefined || productData[key] === '') {
        delete productData[key];
      }
    });
    
    await product.update(productData);
    
    const updatedProduct = await Product.findByPk(id, {
      include: [{
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name', 'logo']
      }]
    });
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product'
    });
  }
};

const getProductsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { limit = 100, page = 1 } = req.query;
    
    if (!brandId || isNaN(brandId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid brand ID'
      });
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    const { count, rows: products } = await Product.findAndCountAll({
      where: { brandId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [{
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name', 'logo']
      }]
    });
    
    res.json({
      success: true,
      brand: brand.name,
      brandId: brand.id,
      products,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching products by brand:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products by brand'
    });
  }
};

const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }
    
    const cleanedProducts = products.map(product => {
      const { id, ...cleanProduct } = product;
      return cleanProduct;
    });
    
    const createdProducts = await Product.bulkCreate(cleanedProducts);
    
    res.status(201).json({
      success: true,
      message: `${createdProducts.length} products created successfully`,
      count: createdProducts.length,
      products: createdProducts
    });
  } catch (error) {
    console.error('Error bulk creating products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create products'
    });
  }
};

const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    if (stock === undefined || stock === null || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required'
      });
    }
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.update({ stock });
    
    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      product: {
        id: product.id,
        title: product.title,
        stock: product.stock
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update stock'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
  getProductsByCategories,
  getCategories,
  getNewArrivals,
  getOnSale,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByBrand,
  bulkCreateProducts,
  updateProductStock
};