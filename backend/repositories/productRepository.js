const { Product } = require('../models');
const { Op } = require('sequelize');

class ProductRepository {
    // Create a new product
    async create(productData) {
        try {
            const product = await Product.create(productData);
            return product;
        } catch (error) {
            throw error;
        }
    }

    // Get all products with pagination and filtering
    async findAll(options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                category, 
                minPrice, 
                maxPrice,
                search,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = options;
            
            const where = {};
            
            if (category) {
                where.category = category;
            }
            
            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price[Op.gte] = minPrice;
                if (maxPrice) where.price[Op.lte] = maxPrice;
            }
            
            if (search) {
                where[Op.or] = [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } },
                    { category: { [Op.iLike]: `%${search}%` } }
                ];
            }
            
            const offset = (page - 1) * limit;
            
            const { count, rows } = await Product.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [[sortBy, sortOrder]],
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            });
            
            return {
                products: rows,
                total: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                limit: parseInt(limit)
            };
        } catch (error) {
            throw error;
        }
    }

    // Get product by ID
    async findById(id) {
        try {
            const product = await Product.findByPk(id, {
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            });
            return product;
        } catch (error) {
            throw error;
        }
    }

    // Get products by category
    async findByCategory(category, limit = 10) {
        try {
            const products = await Product.findAll({
                where: { category },
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });
            return products;
        } catch (error) {
            throw error;
        }
    }

    // Update product
    async update(id, updateData) {
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return null;
            }
            
            await product.update(updateData);
            return product;
        } catch (error) {
            throw error;
        }
    }

    // Delete product
    async delete(id) {
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return false;
            }
            
            await product.destroy();
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Update stock
    async updateStock(id, quantity) {
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return null;
            }
            
            const newStock = product.stock - quantity;
            if (newStock < 0) {
                throw new Error('Insufficient stock');
            }
            
            await product.update({ stock: newStock });
            return product;
        } catch (error) {
            throw error;
        }
    }

    // Get all unique categories
    async getCategories() {
        try {
            const categories = await Product.findAll({
                attributes: ['category'],
                group: ['category'],
                raw: true
            });
            return categories.map(c => c.category);
        } catch (error) {
            throw error;
        }
    }

    // Get product count
    async getProductCount() {
        try {
            const count = await Product.count();
            return count;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ProductRepository();