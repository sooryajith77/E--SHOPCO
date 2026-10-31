










// Admin.jsx - Complete Admin Panel with Image Upload
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { RiDashboardFill } from "react-icons/ri";
import { FaBoxOpen } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { TbMoneybag } from "react-icons/tb";
import { FaStore } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { FaImage } from "react-icons/fa";
import { FaUpload } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Admin.css'

import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearError
} from '../redux/slices/productSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const brandFileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState(null);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showBrandProductsModal, setShowBrandProductsModal] = useState(false);
  const [brandProducts, setBrandProducts] = useState([]);
  const [loadingBrandProducts, setLoadingBrandProducts] = useState(false);
  const [productSortBy, setProductSortBy] = useState('newest');
  const [imagePreview, setImagePreview] = useState(null);
  const [brandImagePreview, setBrandImagePreview] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  
  // Brand form data
  const [brandFormData, setBrandFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    isActive: true
  });
  
  // Dress style options
  const dressStyleOptions = ['Casual', 'Formal', 'Party', 'Gym'];
  const categoryOptions = ['Men', 'Women', 'Accessories', 'Kids'];
  const productCategoryOptions = ['T-Shirts', 'Jeans', 'Jackets', 'Shoes', 'Dresses', 'Accessories', 'Hoodies', 'Pants'];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorOptions = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Gray', 'Brown'];
  
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    price: '',
    oldPrice: '',
    description: '',
    category: '',
    productCategory: '',
    brandId: '',
    dressStyle: 'Casual',
    image: '',
    stock: '',
    isNewArrival: false,
    isOnSale: false,
    sizes: [],
    colors: []
  });

  // Order filter states
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Get products from Redux store
  const { products, loading: productsLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Get auth token
  const getAuthToken = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.token || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Helper function for API calls
  const apiRequest = async (url, options = {}) => {
    try {
      const token = getAuthToken();
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Image upload function
  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);
      const token = getAuthToken();
      
      if (!token) {
        toast.error('You must be logged in to upload images');
        return null;
      }
      
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading image:', file.name, file.size, file.type);
      
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Image upload failed');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      const imageUrl = data.imageUrl || data.url || data.image;
      
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }
      
      return imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Image upload failed: ${error.message}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file selection for product image
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WEBP, GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, image: imageUrl }));
      toast.success('Image uploaded successfully! 🖼️');
    } else {
      // Clear preview if upload failed
      setImagePreview(null);
    }
  };

  // Handle file selection for brand logo
  const handleBrandFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WEBP, GIF)');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBrandImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setBrandFormData(prev => ({ ...prev, logo: imageUrl }));
      toast.success('Logo uploaded successfully! 🖼️');
    } else {
      setBrandImagePreview(null);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerBrandFileInput = () => {
    brandFileInputRef.current?.click();
  };

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || user?.email !== 'admin@shop.co') {
      navigate('/login');
    } else {
      loadDashboardData();
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Fetch brands
  useEffect(() => {
    if (activeTab === 'brands' || activeTab === 'products') {
      fetchBrands();
    }
  }, [activeTab, brandSearchTerm]);

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true);
      setBrandsError(null);
      
      const url = brandSearchTerm 
        ? `${API_URL}/brands/admin/all?search=${brandSearchTerm}&limit=100`
        : `${API_URL}/brands/admin/all?limit=100`;
        
      const data = await apiRequest(url);
      
      if (data.success) {
        setBrands(data.brands || []);
      } else {
        throw new Error(data.message || "Failed to fetch brands");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrandsError(error.message);
      toast.error(`Failed to load brands: ${error.message}`);
    } finally {
      setBrandsLoading(false);
    }
  };

  // Fetch products for a specific brand
  const fetchBrandProducts = async (brandId) => {
    try {
      setLoadingBrandProducts(true);
      const data = await apiRequest(`${API_URL}/brands/${brandId}/products`);
      
      if (data.success) {
        setBrandProducts(data.products || []);
        const brand = brands.find(b => b.id === brandId);
        setSelectedBrand(brand || { id: brandId, name: 'Brand' });
        setShowBrandProductsModal(true);
      } else {
        throw new Error(data.message || 'Failed to fetch brand products');
      }
    } catch (error) {
      console.error('Error fetching brand products:', error);
      toast.warning(`Could not load products for this brand`);
      setBrandProducts([]);
      const brand = brands.find(b => b.id === brandId);
      setSelectedBrand(brand || { id: brandId, name: 'Brand' });
      setShowBrandProductsModal(true);
    } finally {
      setLoadingBrandProducts(false);
    }
  };

  const loadDashboardData = async () => {
    await Promise.all([
      dispatch(fetchProducts()),
      fetchDashboardStats(),
      fetchOrders(),
      fetchUsers()
    ]);
  };

  const fetchDashboardStats = async () => {
    try {
      const stats = await apiRequest(`${API_URL}/admin/dashboard/stats`);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiRequest(`${API_URL}/admin/orders`);
      setOrders(data);
      const totalRevenue = Array.isArray(data) ? data.reduce((sum, order) => {
        if (order.status !== 'cancelled') {
          return sum + (parseFloat(order.total_amount || order.total) || 0);
        }
        return sum;
      }, 0) : 0;
      
      setDashboardStats(prev => ({
        ...prev,
        totalOrders: Array.isArray(data) ? data.length : 0,
        totalRevenue: totalRevenue,
        recentOrders: Array.isArray(data) ? data.slice(0, 5) : []
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiRequest(`${API_URL}/admin/users`);
      setUsers(data);
      setDashboardStats(prev => ({
        ...prev,
        totalUsers: data.length
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  // Brand CRUD Operations
  const handleAddBrand = () => {
    setEditingBrand(null);
    setBrandFormData({
      name: '',
      description: '',
      logo: '',
      website: '',
      isActive: true
    });
    setBrandImagePreview(null);
    setShowBrandModal(true);
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setBrandFormData({
      name: brand.name || '',
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      isActive: brand.isActive !== undefined ? brand.isActive : true
    });
    setBrandImagePreview(brand.logo || null);
    setShowBrandModal(true);
  };

  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand? This will also remove brand association from products.')) {
      return;
    }
    
    try {
      await apiRequest(`${API_URL}/brands/${brandId}`, {
        method: 'DELETE'
      });
      await fetchBrands();
      toast.success('Brand deleted successfully!');
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error(error.message || 'Failed to delete brand');
    }
  };

  const handleSubmitBrand = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const brandData = {
        name: brandFormData.name.trim(),
        description: brandFormData.description?.trim() || '',
        logo: brandFormData.logo?.trim() || '',
        website: brandFormData.website?.trim() || '',
        isActive: brandFormData.isActive
      };

      if (editingBrand) {
        await apiRequest(`${API_URL}/brands/${editingBrand.id}`, {
          method: 'PUT',
          body: JSON.stringify(brandData)
        });
        toast.success('Brand updated successfully! ✅');
      } else {
        await apiRequest(`${API_URL}/brands`, {
          method: 'POST',
          body: JSON.stringify(brandData)
        });
        toast.success('Brand added successfully! ✅');
      }
      
      await fetchBrands();
      setShowBrandModal(false);
      setEditingBrand(null);
      setBrandFormData({
        name: '',
        description: '',
        logo: '',
        website: '',
        isActive: true
      });
      setBrandImagePreview(null);
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(error.message || 'Failed to save brand');
    }
    setLoading(false);
  };

  // Product CRUD Operations
  const handleAddProduct = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      name: '',
      price: '',
      oldPrice: '',
      description: '',
      category: '',
      productCategory: '',
      brandId: '',
      dressStyle: 'Casual',
      image: '',
      stock: '',
      isNewArrival: false,
      isOnSale: false,
      sizes: [],
      colors: []
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleAddProductToBrand = (brandId) => {
    setEditingItem(null);
    setFormData({
      title: '',
      name: '',
      price: '',
      oldPrice: '',
      description: '',
      category: '',
      productCategory: '',
      brandId: brandId,
      dressStyle: 'Casual',
      image: '',
      stock: '',
      isNewArrival: false,
      isOnSale: false,
      sizes: [],
      colors: []
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingItem(product);
    setFormData({
      title: product.title || '',
      name: product.name || '',
      price: product.price || '',
      oldPrice: product.oldPrice || '',
      description: product.description || '',
      category: product.category || '',
      productCategory: product.productCategory || '',
      brandId: product.brandId || '',
      dressStyle: product.dressStyle || 'Casual',
      image: product.image || '',
      stock: product.stock || 100,
      isNewArrival: product.isNewArrival || false,
      isOnSale: product.isOnSale || false,
      sizes: product.sizes || [],
      colors: product.colors || []
    });
    setImagePreview(product.image || null);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    setLoading(true);
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success('Product deleted successfully! ');
      await fetchDashboardStats();
      if (showBrandProductsModal) {
        await fetchBrandProducts(selectedBrand?.id);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
    setLoading(false);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    // Validate image
    if (!formData.image || formData.image.trim() === '') {
      toast.error('Please upload a product image');
      return;
    }
    
    setLoading(true);
    
    try {
      const productData = {
        title: formData.title.trim(),
        name: formData.name?.trim() || formData.title.trim(),
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        description: formData.description.trim(),
        category: formData.category,
        productCategory: formData.productCategory || null,
        brandId: formData.brandId || null,
        dressStyle: formData.dressStyle,
        image: formData.image.trim(),
        stock: parseInt(formData.stock) || 100,
        isNewArrival: formData.isNewArrival || false,
        isOnSale: formData.isOnSale || false,
        sizes: formData.sizes || [],
        colors: formData.colors || []
      };

      console.log('Submitting product:', productData);

      if (editingItem) {
        await dispatch(updateProduct({ 
          id: editingItem.id, 
          productData 
        })).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await dispatch(createProduct(productData)).unwrap();
        toast.success('Product added successfully!');
      }
      
      await fetchDashboardStats();
      await fetchBrands();
      
      if (showBrandProductsModal && selectedBrand) {
        await fetchBrandProducts(selectedBrand.id);
      }
      
      setShowModal(false);
      setEditingItem(null);
      setImagePreview(null);
      resetForm();
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message || 'Unknown error'}`);
    }
    setLoading(false);
  };

  // Reset form helper
  const resetForm = () => {
    setFormData({
      title: '',
      name: '',
      price: '',
      oldPrice: '',
      description: '',
      category: '',
      productCategory: '',
      brandId: '',
      dressStyle: 'Casual',
      image: '',
      stock: '',
      isNewArrival: false,
      isOnSale: false,
      sizes: [],
      colors: []
    });
  };

  // Order Management
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiRequest(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      await fetchOrders();
      await fetchDashboardStats();
      toast.success(`Order #${orderId} status updated to ${newStatus} `);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    try {
      await apiRequest(`${API_URL}/admin/orders/${orderId}`, {
        method: 'DELETE'
      });
      await fetchOrders();
      await fetchDashboardStats();
      toast.success('Order deleted successfully! 🗑️');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  // User Management
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await apiRequest(`${API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      await fetchUsers();
      toast.success(`User role updated to ${newRole} ✅`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await apiRequest(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE'
      });
      await fetchUsers();
      await fetchDashboardStats();
      toast.success('User deleted successfully! 🗑️');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  // Helper functions
  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'shipped': return 'shipped';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      default: return '';
    }
  };

  const getDressStyleBadgeClass = (dressStyle) => {
    switch(dressStyle?.toLowerCase()) {
      case 'casual': return 'casual';
      case 'formal': return 'formal';
      case 'party': return 'party';
      case 'gym': return 'gym';
      default: return '';
    }
  };

  // Sort products
  const getSortedProducts = () => {
    const sorted = [...products];
    switch (productSortBy) {
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return sorted.sort((a, b) => a.title?.localeCompare(b.title));
      case 'name_desc':
        return sorted.sort((a, b) => b.title?.localeCompare(a.title));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status?.toLowerCase() === orderFilter);

  const getStatusCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(o => o.status?.toLowerCase() === status).length;
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FaBoxOpen /></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-number">{dashboardStats.totalProducts}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-number">{dashboardStats.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{dashboardStats.totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><TbMoneybag /></div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-number">${(dashboardStats.totalRevenue || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Orders</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(dashboardStats.recentOrders || []).slice(0, 5).map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.User?.name || 'Guest'}</td>
                <td>${order.total_amount || order.total}</td>
                <td><span className={`status-badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span></td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Products Management Component with Brand
  const ProductsManagement = () => {
    const sortedProducts = getSortedProducts();
    
    return (
      <div className="products-management">
        <div className="section-header">
          <h2>Products Management</h2>
          <div className="section-controls">
            <select 
              value={productSortBy} 
              onChange={(e) => setProductSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
            <button className="btn-primary" onClick={handleAddProduct}>+ Add New Product</button>
          </div>
        </div>
        
        {(productsLoading || loading) ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Product Category</th>
                <th>Dress Style</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map(product => {
                const brand = brands.find(b => b.id === product.brandId);
                return (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="product-thumb"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50';
                        }}
                      />
                    </td>
                    <td>{product.title?.substring(0, 50)}...</td>
                    <td>
                      {brand ? (
                        <span className="brand-tag">{brand.name}</span>
                      ) : (
                        <span className="no-brand">No Brand</span>
                      )}
                    </td>
                    <td>{product.category}</td>
                    <td>{product.productCategory || '-'}</td>
                    <td>
                      <span className={`dress-style-badge ${getDressStyleBadgeClass(product.dressStyle)}`}>
                        {product.dressStyle || 'Casual'}
                      </span>
                    </td>
                    <td>${product.price}</td>
                    <td>{product.stock || 100}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleEditProduct(product)}><MdEdit /> Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteProduct(product.id)}><MdDelete /> Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Orders Management Component
  const OrdersManagement = () => (
    <div className="orders-management">
      <div className="section-header">
        <h2>Orders Management</h2>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`} onClick={() => setOrderFilter('all')}>
            All ({getStatusCount('all')})
          </button>
          <button className={`filter-btn ${orderFilter === 'pending' ? 'active' : ''}`} onClick={() => setOrderFilter('pending')}>
            Pending ({getStatusCount('pending')})
          </button>
          <button className={`filter-btn ${orderFilter === 'processing' ? 'active' : ''}`} onClick={() => setOrderFilter('processing')}>
            Processing ({getStatusCount('processing')})
          </button>
          <button className={`filter-btn ${orderFilter === 'shipped' ? 'active' : ''}`} onClick={() => setOrderFilter('shipped')}>
            Shipped ({getStatusCount('shipped')})
          </button>
          <button className={`filter-btn ${orderFilter === 'delivered' ? 'active' : ''}`} onClick={() => setOrderFilter('delivered')}>
            Delivered ({getStatusCount('delivered')})
          </button>
          <button className={`filter-btn ${orderFilter === 'cancelled' ? 'active' : ''}`} onClick={() => setOrderFilter('cancelled')}>
            Cancelled ({getStatusCount('cancelled')})
          </button>
        </div>
      </div>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.User?.name || order.customer || 'Guest'}</td>
              <td>{order.User?.email || order.email || 'N/A'}</td>
              <td>{order.OrderItems?.length || order.items || 0}</td>
              <td>${order.total_amount || order.total}</td>
              <td>    
                <select 
                  value={order.status} 
                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                  className={`status-select ${order.status}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="actions">
                <button className="btn-view" onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                  <GrFormView />
 View
                </button>
                <button className="btn-delete" onClick={() => handleDeleteOrder(order.id)}><MdDelete /> Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredOrders.length === 0 && (
        <div className="no-orders">No orders found</div>
      )}
    </div>
  );

  // Users Management Component
  const UsersManagement = () => (
    <div className="users-management">
      <div className="section-header">
        <h2>Users Management</h2>
      </div>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select 
                  value={user.role} 
                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                  className="role-select"
                  disabled={user.email === 'admin@shop.co'}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="actions">
                <button 
                  className="btn-delete" 
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.email === 'admin@shop.co'}
                >
                  <MdDelete /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Brands Management Component with Products Display
  const BrandsManagement = () => (
    <div className="brands-management">
      <div className="section-header">
        <h2>Brands Management</h2>
        <button className="btn-primary" onClick={handleAddBrand}>
          + Add New Brand
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search brands..."
          value={brandSearchTerm}
          onChange={(e) => setBrandSearchTerm(e.target.value)}
          className="search-input"
        />
        {brandSearchTerm && (
          <button 
            className="clear-search"
            onClick={() => setBrandSearchTerm("")}
          >
            ✕
          </button>
        )}
      </div>

      {brandsLoading ? (
        <div className="loading">Loading brands...</div>
      ) : brandsError ? (
        <div className="error-container">
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            <h3>Something went wrong</h3>
            <p className="error-message">{brandsError}</p>
            <button onClick={fetchBrands} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      ) : brands.length === 0 ? (
        <div className="empty-state">
          <p>No brands found {brandSearchTerm && `for "${brandSearchTerm}"`}</p>
          {brandSearchTerm && (
            <button onClick={() => setBrandSearchTerm("")} className="btn-secondary">
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="brands-grid">
          {brands.map((brand) => (
            <div key={brand.id} className="brand-card">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="brand-logo"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-brand.png";
                  }}
                />
              ) : (
                <div className="brand-placeholder">
                  <span>{brand.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="brand-info">
                <h3>{brand.name}</h3>
                {brand.description && (
                  <p className="brand-description">
                    {brand.description.length > 100 
                      ? `${brand.description.substring(0, 100)}...` 
                      : brand.description}
                  </p>
                )}
                <span className={`brand-status ${brand.isActive !== false ? 'active' : 'inactive'}`}>
                  {brand.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                
                {/* Display products under this brand */}
                <div className="brand-products-info">
                  <span className="product-count">
                     {brand.productCount || 0} products
                  </span>
                  <div className="brand-product-actions">
                    <button 
                      className="btn-view-products"
                      onClick={() => fetchBrandProducts(brand.id)}
                    >
                      View Products
                    </button>
                    <button 
                      className="btn-add-product"
                      onClick={() => {
                        setActiveTab('products');
                        handleAddProductToBrand(brand.id);
                      }}
                    >
                      + Add Product
                    </button>
                  </div>
                </div>
              </div>
              <div className="brand-actions">
                <button className="btn-edit" onClick={() => handleEditBrand(brand)}><MdEdit /> Edit</button>
                <button className="btn-delete" onClick={() => handleDeleteBrand(brand.id)}><MdDelete /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Categories Management Component
  const CategoriesManagement = () => (
    <div className="categories-management">
      <div className="section-header">
        <h2>Categories Management</h2>
        <button className="btn-primary" onClick={() => toast.info('Add Category functionality coming soon!')}>
          + Add New Category
        </button>
      </div>
      <div className="placeholder-content">
        <p>Category management features will be available here.</p>
        <div className="placeholder-icon">📂</div>
      </div>
    </div>
  );

  // Settings Component
  const Settings = () => (
    <div className="settings">
      <div className="section-header">
        <h2>Settings</h2>
      </div>
      <div className="settings-grid">
        <div className="settings-card">
          <h3>General Settings</h3>
          <div className="settings-item">
            <label>Store Name</label>
            <input type="text" value="SHOP.CO" className="form-input" disabled />
          </div>
          <div className="settings-item">
            <label>Store Email</label>
            <input type="email" value="admin@shop.co" className="form-input" disabled />
          </div>
        </div>
        <div className="settings-card">
          <h3>Appearance</h3>
          <div className="settings-item">
            <label>Theme</label>
            <select className="form-input" disabled>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
        </div>
        <div className="settings-card">
          <h3>System Info</h3>
          <div className="settings-item">
            <label>Version</label>
            <span>1.0.0</span>
          </div>
          <div className="settings-item">
            <label>Environment</label>
            <span>{import.meta.env.VITE_ENV || 'Development'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-panel">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>SHOP.CO</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="admin-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon"><RiDashboardFill /></span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''} 
            onClick={() => setActiveTab('products')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">Products</span>
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-label">Orders</span>
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Users</span>
          </button>
          <button 
            className={activeTab === 'brands' ? 'active' : ''} 
            onClick={() => setActiveTab('brands')}
          >
            <span className="nav-icon">🏷️</span>
            <span className="nav-label">Brands</span>
          </button>
          <button 
            className={activeTab === 'categories' ? 'active' : ''} 
            onClick={() => setActiveTab('categories')}
          >
            <span className="nav-icon">📂</span>
            <span className="nav-label">Categories</span>
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout-sidebar" onClick={() => navigate('/')}>
            <span className="nav-icon"><FaStore /></span>
            <span className="nav-label">View Store</span>
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Welcome back, {user?.name || 'Admin'}!</h1>
            <p className="subtitle">Manage your store efficiently</p>
          </div>
          <div className="header-actions">
            <span className="admin-badge"><RiAdminFill /> Admin</span>
          </div>
        </div>

        <div className="admin-main">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'products' && <ProductsManagement />}
          {activeTab === 'orders' && <OrdersManagement />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'brands' && <BrandsManagement />}
          {activeTab === 'categories' && <CategoriesManagement />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>

      {/* Product Modal with Image Upload */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitProduct}>
              {/* Product Name */}
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Enter product name"
                />
              </div>

              {/* Brand Selection */}
              <div className="form-group">
                <label>Brand *</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">Select a Brand</option>
                  {brands.filter(b => b.isActive !== false).map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {brands.length === 0 && (
                  <small style={{color: '#999', display: 'block', marginTop: '5px'}}>
                    No brands available. Please <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('brands'); setShowModal(false); }}>add a brand first</a>
                  </small>
                )}
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Product Category */}
              <div className="form-group">
                <label>Product Category</label>
                <select
                  value={formData.productCategory}
                  onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                  className="form-input"
                >
                  <option value="">Select Product Category</option>
                  {productCategoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Dress Style */}
              <div className="form-group">
                <label>Dress Style *</label>
                <select
                  value={formData.dressStyle}
                  onChange={(e) => setFormData({ ...formData, dressStyle: e.target.value })}
                  required
                  className="form-input"
                >
                  {dressStyleOptions.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* Price and Old Price */}
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Old Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="form-input"
                  rows="3"
                  placeholder="Enter product description"
                />
              </div>

              {/* Image Upload with Preview */}
              <div className="form-group">
                <label>Product Image *</label>
                <div className="image-upload-container">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  <div 
                    className="image-upload-area"
                    onClick={triggerFileInput}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#4CAF50';
                      e.currentTarget.style.background = '#f0f8f0';
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.background = '#fafafa';
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.background = '#fafafa';
                      
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const event = { target: { files: [file] } };
                        await handleFileSelect(event);
                      }
                    }}
                    style={{
                      border: '2px dashed #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: '#fafafa',
                      minHeight: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaImage size={40} color="#999" />
                    <p style={{ margin: '10px 0 5px 0', fontWeight: 'bold' }}>
                      Click to upload or drag & drop
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      Supported: JPEG, PNG, WEBP, GIF (max 5MB)
                    </p>
                  </div>

                  {(imagePreview || formData.image) && (
                    <div className="image-preview-container" style={{ marginTop: '15px' }}>
                      <img 
                        src={imagePreview || formData.image} 
                        alt="Product preview" 
                        className="image-preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #ddd'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, image: '' });
                        }}
                        className="btn-remove-image"
                        style={{
                          marginTop: '10px',
                          padding: '5px 15px',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove Image
                      </button>
                      {uploadingImage && (
                        <p style={{ color: '#4CAF50', marginTop: '5px' }}>
                          Uploading...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="form-input"
                  placeholder="100"
                />
              </div>

              {/* Sizes */}
              <div className="form-group">
                <label>Sizes <span style={{color: '#999', fontWeight: 'normal'}}>(Select multiple)</span></label>
                <select
                  multiple
                  value={formData.sizes}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, sizes: selected });
                  }}
                  className="form-input"
                  style={{height: '100px'}}
                >
                  {sizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <small style={{color: '#999'}}>Hold Ctrl/Cmd to select multiple</small>
              </div>

              {/* Colors */}
              <div className="form-group">
                <label>Colors <span style={{color: '#999', fontWeight: 'normal'}}>(Select multiple)</span></label>
                <select
                  multiple
                  value={formData.colors}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, colors: selected });
                  }}
                  className="form-input"
                  style={{height: '100px'}}
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                <small style={{color: '#999'}}>Hold Ctrl/Cmd to select multiple</small>
              </div>

              {/* Checkboxes */}
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  />
                  New Arrival
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isOnSale}
                    onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                  />
                  On Sale
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-update" disabled={loading || uploadingImage}>
                  {loading || uploadingImage ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal with Logo Upload */}
      {showBrandModal && (
        <div className="modal-overlay" onClick={() => setShowBrandModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h2>
              <button className="modal-close" onClick={() => setShowBrandModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitBrand}>
              <div className="form-group">
                <label>Brand Name *</label>
                <input
                  type="text"
                  value={brandFormData.name}
                  onChange={(e) => setBrandFormData({ ...brandFormData, name: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Enter brand name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={brandFormData.description}
                  onChange={(e) => setBrandFormData({ ...brandFormData, description: e.target.value })}
                  className="form-input"
                  rows="3"
                  placeholder="Enter brand description"
                />
              </div>

              {/* Brand Logo Upload */}
              <div className="form-group">
                <label>Brand Logo</label>
                <div className="image-upload-container">
                  <input
                    ref={brandFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBrandFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  <div 
                    className="image-upload-area"
                    onClick={triggerBrandFileInput}
                    style={{
                      border: '2px dashed #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: '#fafafa',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaImage size={30} color="#999" />
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                      Click to upload logo
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      Supported: JPEG, PNG, WEBP, GIF (max 2MB)
                    </p>
                  </div>

                  {(brandImagePreview || brandFormData.logo) && (
                    <div className="image-preview-container" style={{ marginTop: '15px' }}>
                      <img 
                        src={brandImagePreview || brandFormData.logo} 
                        alt="Brand logo preview" 
                        className="image-preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '150px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '1px solid #ddd'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBrandImagePreview(null);
                          setBrandFormData({ ...brandFormData, logo: '' });
                        }}
                        className="btn-remove-image"
                        style={{
                          marginTop: '10px',
                          padding: '5px 15px',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={brandFormData.website}
                  onChange={(e) => setBrandFormData({ ...brandFormData, website: e.target.value })}
                  className="form-input"
                  placeholder="https://example.com"
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={brandFormData.isActive}
                    onChange={(e) => setBrandFormData({ ...brandFormData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowBrandModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || uploadingImage}>
                  {loading || uploadingImage ? 'Saving...' : (editingBrand ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Products Modal */}
      {showBrandProductsModal && selectedBrand && (
        <div className="modal-overlay" onClick={() => setShowBrandProductsModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Products for {selectedBrand.name}</h2>
              <button className="modal-close" onClick={() => setShowBrandProductsModal(false)}>&times;</button>
            </div>
            
            {loadingBrandProducts ? (
              <div className="loading">Loading products...</div>
            ) : brandProducts.length > 0 ? (
              <>
                <div className="brand-products-header">
                  <span>Total: {brandProducts.length} products</span>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowBrandProductsModal(false);
                      handleAddProductToBrand(selectedBrand.id);
                    }}
                  >
                    + Add Product to {selectedBrand.name}
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="product-thumb"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50';
                            }}
                          />
                        </td>
                        <td>{product.title}</td>
                        <td>${product.price}</td>
                        <td>{product.category}</td>
                        <td>{product.stock}</td>
                        <td className="actions">
                          <button 
                            className="btn-edit" 
                            onClick={() => {
                              setShowBrandProductsModal(false);
                              handleEditProduct(product);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => {
                              if (window.confirm(`Delete "${product.title}"?`)) {
                                handleDeleteProduct(product.id);
                              }
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="empty-state">
                <p>No products found for {selectedBrand.name}</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowBrandProductsModal(false);
                    handleAddProductToBrand(selectedBrand.id);
                  }}
                >
                  + Add First Product to {selectedBrand.name}
                </button>
              </div>
            )}
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowBrandProductsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details #{selectedOrder.id}</h2>
              <button className="modal-close" onClick={() => setShowOrderModal(false)}>&times;</button>
            </div>
            
            <div className="info-card">
              <h4>Order Information</h4>
              <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
              <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p><strong>Last Updated:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
              <p><strong>Status:</strong> <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>{selectedOrder.status?.toUpperCase()}</span></p>
              <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
            </div>

            <div className="info-card">
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> {selectedOrder.User?.name || 'Guest'}</p>
              <p><strong>Email:</strong> {selectedOrder.User?.email || 'N/A'}</p>
              <p><strong>User ID:</strong> {selectedOrder.userId || 'N/A'}</p>
            </div>

            <div className="info-card">
              <h4>Shipping Address</h4>
              <p>{selectedOrder.shippingAddress || 'No address provided'}</p>
            </div>

            <div className="info-card">
              <h4>Payment Summary</h4>
              <p><strong>Total Amount:</strong> ${selectedOrder.total_amount || selectedOrder.total}</p>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowOrderModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;