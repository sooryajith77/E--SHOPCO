

// pages/CategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './CategoryPage.css';

const API_URL = 'http://localhost:5000/api';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedDressStyles, setSelectedDressStyles] = useState([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Most Popular');
  const productsPerPage = 9;

  // Available filters
  const productCategories = ['T-Shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans', 'Jackets', 'Blouses', 'Coats', 'Pants', 'Shoes', 'Accessories', 'Dresses'];
  
  const colorsList = [
    { name: 'Black', value: 'black', hex: '#000000' },
    { name: 'White', value: 'white', hex: '#ffffff' },
    { name: 'Red', value: 'red', hex: '#ef4444' },
    { name: 'Blue', value: 'blue', hex: '#3b82f6' },
    { name: 'Green', value: 'green', hex: '#22c55e' },
    { name: 'Yellow', value: 'yellow', hex: '#eab308' },
    { name: 'Purple', value: 'purple', hex: '#a855f7' },
    { name: 'Pink', value: 'pink', hex: '#ec4899' },
    { name: 'Brown', value: 'brown', hex: '#8b4513' },
    { name: 'Gray', value: 'gray', hex: '#6b7280' },
    { name: 'Navy', value: 'navy', hex: '#1e3a8a' },
    { name: 'Teal', value: 'teal', hex: '#008080' },
  ];
  
  const sizes = ['XX-Small', 'Small', 'Medium', 'Large', 'XX-Large', '4X-Large'];
  const dressStyles = ['Casual', 'Formal', 'Party', 'Gym'];

  // Fetch products by specific category from backend
  useEffect(() => {
    fetchProductsByCategory();
  }, [category]);

  const fetchProductsByCategory = async () => {
    setLoading(true);
    try {
      // Format category name for display
      const formattedCategory = category?.charAt(0).toUpperCase() + category?.slice(1);
      setCategoryName(formattedCategory || '');
      
      // Fetch products filtered by category from API
      const response = await fetch(`${API_URL}/products/category/${category}`);
      
      if (!response.ok) {
        // If category endpoint fails, try fetching all and filtering
        const allProductsResponse = await fetch(`${API_URL}/products`);
        const allData = await allProductsResponse.json();
        let productsList = allData.products || allData || [];
        
        // Filter by category OR dressStyle
        const categoryLower = category?.toLowerCase();
        const formattedCategoryLower = formattedCategory?.toLowerCase();
        
        productsList = productsList.filter(product => {
          const productCategory = product.category?.toLowerCase() || '';
          const productDressStyle = product.dressStyle?.toLowerCase() || '';
          
          return productCategory === categoryLower ||
                 productCategory === formattedCategoryLower ||
                 productDressStyle === categoryLower ||
                 productDressStyle === formattedCategoryLower ||
                 productCategory.includes(categoryLower) ||
                 productDressStyle.includes(categoryLower);
        });
        
        setProducts(productsList);
        setFilteredProducts(productsList);
      } else {
        const data = await response.json();
        const productsList = data.products || data || [];
        setProducts(productsList);
        setFilteredProducts(productsList);
      }
    } catch (error) {
      console.error('Error fetching products by category:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...products];

    // ✅ FILTER BY PRODUCT CATEGORY (productCategory or category field)
    if (selectedProductCategories.length > 0) {
      filtered = filtered.filter(product => {
        const productCategory = product.category || product.productCategory || '';
        return selectedProductCategories.some(cat => 
          productCategory.toLowerCase().includes(cat.toLowerCase()) ||
          cat.toLowerCase().includes(productCategory.toLowerCase())
        );
      });
    }

    // Filter by colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => {
        const productColor = product.color?.toLowerCase() || '';
        return selectedColors.some(color => 
          productColor.includes(color) || color.includes(productColor)
        );
      });
    }

    // Filter by sizes
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => {
        const productSize = product.size || '';
        return selectedSizes.some(size => 
          productSize.toLowerCase().includes(size.toLowerCase()) ||
          size.toLowerCase().includes(productSize.toLowerCase())
        );
      });
    }

    // ✅ FILTER BY DRESS STYLE
    if (selectedDressStyles.length > 0) {
      filtered = filtered.filter(product => {
        const dressStyle = product.dressStyle || '';
        return selectedDressStyles.some(style => 
          dressStyle.toLowerCase().includes(style.toLowerCase()) ||
          style.toLowerCase().includes(dressStyle.toLowerCase())
        );
      });
    }

    // Filter by price
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    if (sortBy === 'Price: Low to High') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Rating: High to Low') {
      filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    } else if (sortBy === 'Newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [selectedProductCategories, selectedColors, selectedSizes, selectedDressStyles, priceRange, products, sortBy]);

  const handleProductCategoryChange = (category) => {
    setSelectedProductCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleColorChange = (color) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleDressStyleChange = (style) => {
    setSelectedDressStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const clearFilters = () => {
    setSelectedProductCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedDressStyles([]);
    setPriceRange([0, 500]);
    setSortBy('Most Popular');
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) return <Loader />;

  const activeFilterCount = selectedProductCategories.length + selectedColors.length + selectedSizes.length + selectedDressStyles.length;

  const StarRating = ({ rating }) => {
    const rate = rating?.rate || rating || 0;
    const fullStars = Math.floor(rate);
    return (
      <div className="rating">
        {'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}
        <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>{rate}/5</span>
      </div>
    );
  };

  return (
    <div className="category-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span> &gt; </span>
          <span className="active">{categoryName || category || 'Products'}</span>
        </div>

        <div className="page-layout">
          {/* Sidebar Filters - Only show if there are products */}
          {products.length > 0 && (
            <aside className="filters-sidebar">
              <h2 className="filters-title">Filters</h2>

              {/* Categories Filter */}
              <div className="filter-group">
                <h3 className="filter-heading">Categories</h3>
                <div className="filter-options">
                  {productCategories.map(cat => (
                    <label key={cat} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedProductCategories.includes(cat)}
                        onChange={() => handleProductCategoryChange(cat)}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="filter-group">
                <h3 className="filter-heading">Price</h3>
                <div className="price-filter">
                  <div className="price-inputs">
                    <div className="price-input">
                      <span>$</span>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        min="0"
                        max="1000"
                      />
                    </div>
                    <span>-</span>
                    <div className="price-input">
                      <span>$</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                        min="0"
                        max="1000"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="price-slider"
                  />
                </div>
              </div>

              {/* Colors Filter */}
              <div className="filter-group">
                <h3 className="filter-heading">Colors</h3>
                <div className="color-options">
                  {colorsList.map(color => (
                    <div
                      key={color.value}
                      className={`color-circle ${selectedColors.includes(color.value) ? 'selected' : ''}`}
                      style={{ backgroundColor: color.hex, border: color.value === 'white' ? '1px solid #ddd' : 'none' }}
                      onClick={() => handleColorChange(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="filter-group">
                <h3 className="filter-heading">Size</h3>
                <div className="size-options">
                  {sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                      onClick={() => handleSizeChange(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dress Style Filter */}
              <div className="filter-group">
                <h3 className="filter-heading">Dress Style</h3>
                <div className="filter-options">
                  {dressStyles.map(style => (
                    <label key={style} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedDressStyles.includes(style)}
                        onChange={() => handleDressStyleChange(style)}
                      />
                      <span>{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="apply-filter-btn" onClick={applyFilters}>
                Apply Filter
              </button>
            </aside>
          )}

          {/* Main Content */}
          <div className="main-content">
            {products.length > 0 && (
              <button
                className="mobile-filter-btn"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                🔍 Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            )}

            <div className="content-header">
              <div>
                <h1 className="category-title">{categoryName || 'All Products'}</h1>
                <p className="product-count">
                  Showing {currentProducts.length} of {filteredProducts.length} Products
                </p>
              </div>
              {products.length > 0 && (
                <div className="sort-container">
                  <span className="sort-label">Sort by:</span>
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option>Most Popular</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Rating: High to Low</option>
                  </select>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="active-filters">
                {selectedProductCategories.map(cat => (
                  <span key={cat} className="filter-pill">
                    {cat}
                    <button onClick={() => handleProductCategoryChange(cat)}>✕</button>
                  </span>
                ))}
                {selectedColors.map(color => (
                  <span key={color} className="filter-pill">
                    {color}
                    <button onClick={() => handleColorChange(color)}>✕</button>
                  </span>
                ))}
                {selectedSizes.map(size => (
                  <span key={size} className="filter-pill">
                    {size}
                    <button onClick={() => handleSizeChange(size)}>✕</button>
                  </span>
                ))}
                {selectedDressStyles.map(style => (
                  <span key={style} className="filter-pill">
                    {style}
                    <button onClick={() => handleDressStyleChange(style)}>✕</button>
                  </span>
                ))}
                <button className="clear-all-btn" onClick={clearFilters}>
                  Clear All
                </button>
              </div>
            )}

            {/* No Products Found Message */}
            {products.length === 0 && !loading && (
              <div className="no-products-found">
                <div className="no-products-icon">📭</div>
                <h2>No Products Found</h2>
                <p>Sorry, we couldn't find any products in the <strong>{categoryName}</strong> category.</p>
                <p>Try browsing other categories or check back later for new arrivals!</p>
                <div className="no-products-actions">
                  <button 
                    className="browse-all-btn"
                    onClick={() => navigate('/shop')}
                  >
                    Browse All Products
                  </button>
                  <button 
                    className="go-home-btn"
                    onClick={() => navigate('/')}
                  >
                    Go to Homepage
                  </button>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {products.length > 0 && (
              <>
                <div className="product-grid">
                  {currentProducts.map(product => (
                    <div
                      key={product.id}
                      className="product-card"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <img src={product.image} alt={product.title || product.name} className="product-image" />
                      <h3 className="product-name">{product.title || product.name}</h3>
                      {/* Show dressStyle badge if available */}
                      {product.dressStyle && (
                        <span className="dress-style-badge">{product.dressStyle}</span>
                      )}
                      <StarRating rating={product.rating} />
                      <div className="price-container">
                        <span className="current-price">${product.price}</span>
                        {product.oldPrice && (
                          <>
                            <span className="original-price">${product.oldPrice}</span>
                            <span className="discount">-{product.discount}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* No Results After Filtering */}
                {filteredProducts.length === 0 && (
                  <div className="no-results">
                    <h3>No products match your filters</h3>
                    <p>Try adjusting your filter criteria</p>
                    <button className="clear-all-btn" onClick={clearFilters}>Clear All Filters</button>
                  </div>
                )}

                {/* Pagination */}
                {filteredProducts.length > 0 && totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    <span className="page-info">Page {currentPage} of {totalPages}</span>
                    <button
                      className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && products.length > 0 && (
        <>
          <div className="modal-overlay" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="mobile-modal">
            <div className="modal-header">
              <h2>Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="filter-group">
                <h3 className="filter-heading">Categories</h3>
                <div className="filter-options">
                  {productCategories.map(cat => (
                    <label key={cat} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedProductCategories.includes(cat)}
                        onChange={() => handleProductCategoryChange(cat)}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <h3 className="filter-heading">Price</h3>
                <div className="price-filter">
                  <div className="price-inputs">
                    <div className="price-input">
                      <span>$</span>
                      <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])} />
                    </div>
                    <span>-</span>
                    <div className="price-input">
                      <span>$</span>
                      <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="filter-group">
                <h3 className="filter-heading">Colors</h3>
                <div className="color-options">
                  {colorsList.map(color => (
                    <div
                      key={color.value}
                      className={`color-circle ${selectedColors.includes(color.value) ? 'selected' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => handleColorChange(color.value)}
                    />
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <h3 className="filter-heading">Size</h3>
                <div className="size-options">
                  {sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                      onClick={() => handleSizeChange(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <h3 className="filter-heading">Dress Style</h3>
                <div className="filter-options">
                  {dressStyles.map(style => (
                    <label key={style} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedDressStyles.includes(style)}
                        onChange={() => handleDressStyleChange(style)}
                      />
                      <span>{style}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="apply-filter-btn" onClick={() => { applyFilters(); setIsMobileFilterOpen(false); }}>Apply Filter</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .no-products-found {
          text-align: center;
          padding: 80px 40px;
          background: #f9f9f9;
          border-radius: 20px;
          margin: 40px 0;
        }

        .no-products-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .no-products-found h2 {
          font-size: 28px;
          margin-bottom: 16px;
          color: #333;
        }

        .no-products-found p {
          color: #666;
          margin-bottom: 12px;
          font-size: 16px;
        }

        .no-products-found strong {
          color: #000;
        }

        .no-products-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 32px;
        }

        .browse-all-btn, .go-home-btn {
          padding: 12px 28px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .browse-all-btn {
          background: #000;
          color: white;
          border: none;
        }

        .browse-all-btn:hover {
          background: #333;
        }

        .go-home-btn {
          background: white;
          color: #000;
          border: 1px solid #ddd;
        }

        .go-home-btn:hover {
          background: #f5f5f5;
          border-color: #000;
        }

        .no-results {
          text-align: center;
          padding: 60px 20px;
          background: #fef3c7;
          border-radius: 16px;
          margin: 40px 0;
        }

        .no-results h3 {
          font-size: 20px;
          margin-bottom: 12px;
          color: #92400e;
        }

        .no-results p {
          color: #b45309;
          margin-bottom: 20px;
        }

        .dress-style-badge {
          display: inline-block;
          background: #f0f0f0;
          color: #333;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          margin: 4px 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;