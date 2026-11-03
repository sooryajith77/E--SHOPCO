

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path'); 
// Load env vars
dotenv.config();
const { sequelize } = require('./models');
// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
// Add this with other route imports
const addressRoutes = require('./routes/addressRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Add this


const brandRoutes = require("./routes/brandRoutes");


const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://e--shopco.soorya8590.workers.dev"
  ],
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

 // Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
// Add this with other route mounts
app.use('/api/addresses', addressRoutes);
app.use('/api', uploadRoutes); // Add this - mounts /api/upload

app.use("/api/brands", brandRoutes);
// Root route
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running...' });
});

// // Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Sync database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sync all models (set force: true only in development to drop tables)
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

 startServer();





