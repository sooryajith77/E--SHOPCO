

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import './Brands.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BrandProducts = () => {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(`Fetching brand ID: ${id}`);

        // ✅ Use the brand products endpoint directly
        const response = await fetch(`${API_URL}/brands/${id}/products`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Brand not found");
          }
          throw new Error(`Failed to fetch brand: ${response.status}`);
        }

        const data = await response.json();
        console.log("Brand Products Data:", data);

        if (!data.success) {
          throw new Error(data.message || "Failed to load brand");
        }

        setBrand({
          id: data.brandId,
          name: data.brand,
          productCount: data.productCount
        });
        setProducts(data.products || []);

      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // ✅ Sort products
  const getSortedProducts = () => {
    const sorted = [...products];
    switch (sortBy) {
      case "price_low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
      case "newest":
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  // ✅ Handle image error for brand logo
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    const placeholder = parent.querySelector('.brand-detail-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  // ✅ Handle retry
  const handleRetry = () => {
    setError("");
    setLoading(true);
    // Re-fetch by updating a state
    setProducts([]);
    const loadData = async () => {
      try {
        const response = await fetch(`${API_URL}/brands/${id}/products`);
        if (!response.ok) {
          throw new Error(`Failed to fetch brand: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to load brand");
        }
        setBrand({
          id: data.brandId,
          name: data.brand,
          productCount: data.productCount
        });
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="brand-loading">
          <div className="skeleton-header"></div>
          <div className="grid-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            <h2>Something went wrong</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <Link to="/brands" className="btn-primary">
                ← Browse All Brands
              </Link>
              <button 
                onClick={handleRetry}
                className="retry-button"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container">
        <div className="empty-state">
          <span className="empty-icon">🏷️</span>
          <h2>Brand Not Found</h2>
          <p>The brand you are looking for does not exist or has been removed.</p>
          <Link to="/brands" className="btn-primary">
            ← Browse All Brands
          </Link>
        </div>
      </div>
    );
  }

  const sortedProducts = getSortedProducts();

  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/brands">Brands</Link>
        <span>›</span>
        <span className="current">{brand.name}</span>
      </nav>

      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-info">
          <div className="brand-image-container">
            <img 
              src={brand.logo} 
              alt={brand.name}
              className="brand-detail-logo"
              onError={handleImageError}
            />
            <div 
              className="brand-detail-placeholder"
              style={{ display: brand.logo ? 'none' : 'flex' }}
            >
              <span>{brand.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="brand-details">
            <h1>{brand.name}</h1>
            {brand.description && (
              <p className="brand-detail-description">{brand.description}</p>
            )}
            <div className="brand-stats">
              <span className="product-count">
                 {brand.productCount || products.length} Products
              </span>
              {brand.isActive !== false && (
                <span className="brand-status active">● Active</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛍️</div>
          <h3>No Products Available</h3>
          <p>This brand doesn't have any products yet.</p>
          <Link to="/products" className="btn-primary">
            Browse All Products
          </Link>
        </div>
      ) : (
        <>
          <div className="products-header">
            <h2>All Products</h2>
            <div className="products-controls">
              <span className="product-count">{products.length} items</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
          <div className="grid-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BrandProducts;