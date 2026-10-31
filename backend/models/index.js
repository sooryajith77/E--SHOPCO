

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import models
const UserModel = require('./User');
const ProductModel = require('./Product');
const BrandModel = require('./Brand');
const OrderModel = require('./Order');
const OrderItemModel = require('./OrderItem');
const CartModel = require('./Cart');
const CartItemModel = require('./CartItem');
const WishlistModel = require('./Wishlist');
const UserAddressModel = require('./UserAddress');
// Initialize models
const User = UserModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const Brand = BrandModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);
const OrderItem = OrderItemModel(sequelize, DataTypes);
const Cart = CartModel(sequelize, DataTypes);
const CartItem = CartItemModel(sequelize, DataTypes);
const Wishlist = WishlistModel(sequelize, DataTypes);
const UserAddress = UserAddressModel(sequelize, DataTypes);
// Define associations
// User - Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order - OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product - OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User - Cart
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cart - CartItem
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// Product - CartItem
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User - Wishlist
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Product - Wishlist
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlistedBy' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Brand - Product
Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });


User.hasMany(UserAddress, { foreignKey: 'userId', as: 'addresses' });
UserAddress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Product,
  Brand,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Wishlist,
  UserAddress
};