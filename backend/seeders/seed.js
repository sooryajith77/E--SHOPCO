



const { sequelize, User, Product, Brand } = require('./models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shop.co',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    
    // Create regular user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('test123', 10),
      role: 'user'
    });
    
    // Create brands
    const brands = await Brand.bulkCreate([
      { name: 'VERSACE', isActive: true },
      { name: 'ZARA', isActive: true },
      { name: 'GUCCI', isActive: true },
      { name: 'PRADA', isActive: true },
      { name: 'Calvin Klein', isActive: true }
    ]);
    
    // Create products
    const products = await Product.bulkCreate([
      {
        title: 'Gradient Graphic T-shirt',
        name: 'Gradient Graphic T-shirt',
        price: 145,
        oldPrice: null,
        discount: 0,
        description: 'Stylish gradient graphic t-shirt made from premium cotton.',
        category: 'Casual',
        productCategory: 'T-shirts',
        color: 'red',
        size: 'Medium',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        stock: 100,
        rating: { rate: 4.5, count: 120 },
        isNewArrival: true,
        isOnSale: false
      },
      {
        title: 'Polo with Tipping Details',
        name: 'Polo with Tipping Details',
        price: 180,
        oldPrice: null,
        discount: 0,
        description: 'Classic polo shirt with elegant tipping details.',
        category: 'Formal',
        productCategory: 'Shirts',
        color: 'blue',
        size: 'Large',
        image: 'https://images.unsplash.com/photo-1586363104869-3c6d6c6e9b8c?w=400',
        stock: 75,
        rating: { rate: 4.5, count: 89 },
        isNewArrival: true,
        isOnSale: false
      },
      {
        title: 'Black Striped T-shirt',
        name: 'Black Striped T-shirt',
        price: 120,
        oldPrice: 150,
        discount: 20,
        description: 'Comfortable black striped t-shirt, perfect for casual wear.',
        category: 'Casual',
        productCategory: 'T-shirts',
        color: 'black',
        size: 'Small',
        image: 'https://static.vecteezy.com/system/resources/thumbnails/059/069/519/small/two-men-in-black-t-shirts-standing-in-front-of-a-gray-background-photo.jpeg',
        stock: 50,
        rating: { rate: 5.0, count: 200 },
        isNewArrival: false,
        isOnSale: true
      },
      {
        title: 'Skinny Fit Jeans',
        name: 'Skinny Fit Jeans',
        price: 240,
        oldPrice: 260,
        discount: 8,
        description: 'Modern skinny fit jeans with stretch comfort.',
        category: 'Casual',
        productCategory: 'Jeans',
        color: 'blue',
        size: 'Medium',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
        stock: 60,
        rating: { rate: 3.5, count: 45 },
        isNewArrival: false,
        isOnSale: true
      },
      {
        title: 'Checkered Shirt',
        name: 'Checkered Shirt',
        price: 180,
        oldPrice: null,
        discount: 0,
        description: 'Classic checkered pattern shirt for a stylish look.',
        category: 'Casual',
        productCategory: 'Shirts',
        color: 'red',
        size: 'Large',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        stock: 85,
        rating: { rate: 4.5, count: 67 },
        isNewArrival: true,
        isOnSale: false
      },
      {
        title: 'Sleeve Striped T-shirt',
        name: 'Sleeve Striped T-shirt',
        price: 130,
        oldPrice: 160,
        discount: 19,
        description: 'Casual striped t-shirt with comfortable fit.',
        category: 'Casual',
        productCategory: 'T-shirts',
        color: 'green',
        size: 'Small',
        image: 'https://t4.ftcdn.net/jpg/12/04/58/65/360_F_1204586528_1uk4jMhRrpg96mwuIqtO7lxxOtlzu9Gw.jpg',
        stock: 40,
        rating: { rate: 4.5, count: 34 },
        isNewArrival: false,
        isOnSale: true
      },
      {
        title: 'Loose Fit Bermuda Shorts',
        name: 'Loose Fit Bermuda Shorts',
        price: 80,
        oldPrice: null,
        discount: 0,
        description: 'Comfortable loose fit bermuda shorts for summer.',
        category: 'Casual',
        productCategory: 'Shorts',
        color: 'green',
        size: 'XX-Large',
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
        stock: 90,
        rating: { rate: 3.0, count: 23 },
        isNewArrival: true,
        isOnSale: false
      }
    ]);
    
    console.log('Database seeded successfully!');
    console.log('Admin user - Email: admin@shop.co, Password: admin123');
    console.log('Test user - Email: test@example.com, Password: test123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();