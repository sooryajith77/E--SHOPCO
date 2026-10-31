




import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [productCounts, setProductCounts] = useState({});

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ✅ Use the with-count endpoint for better performance
        const url = searchTerm 
          ? `${API_URL}/brands?search=${searchTerm}&limit=100`
          : `${API_URL}/brands/with-count`;
          
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch brands: ${response.status}`);
        }

        const data = await response.json();

        console.log("Brands data:", data);

        if (data.success) {
          const brandsData = data.brands || [];
          setBrands(brandsData);
          
          // ✅ Extract product counts
          const counts = {};
          brandsData.forEach(brand => {
            counts[brand.id] = brand.productCount || 0;
          });
          setProductCounts(counts);
        } else {
          throw new Error(data.message || "Failed to fetch brands");
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchBrands, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // ✅ Handle retry
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-fetch by changing a state
    setSearchTerm(prev => prev);
  };

  // ✅ Skeleton Loader
  const SkeletonLoader = () => (
    <div className="brands-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="brand-card skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text" style={{width: '60%'}}></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="container">
        <div className="brands-header">
          <h1>Brands</h1>
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="brands-header">
          <h1>Brands</h1>
        </div>
        <div className="error-container">
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            <h2>Something went wrong</h2>
            <p className="error-message">{error}</p>
            <button 
              onClick={handleRetry}
              className="retry-button"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="brands-header">
        <h1>Brands</h1>
        <span className="brands-count">{brands.length} brands</span>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="clear-search"
            onClick={() => setSearchTerm("")}
          >
            ✕
          </button>
        )}
      </div>

      {brands.length === 0 ? (
        <div className="empty-state">
          <p>No brands found {searchTerm && `for "${searchTerm}"`}</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="btn-primary">
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="brands-grid">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brands/${brand.id}`}
              className="brand-card"
            >
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

              <h3>{brand.name}</h3>
              
              {brand.description && (
                <p className="brand-description">
                  {brand.description.length > 100 
                    ? `${brand.description.substring(0, 100)}...` 
                    : brand.description}
                </p>
              )}

              {/* ✅ Show product count */}
              <div className="brand-product-count">
                <span className="product-count-badge">
                   {productCounts[brand.id] || brand.productCount || 0} products
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Brands;