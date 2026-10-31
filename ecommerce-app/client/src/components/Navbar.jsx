



import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { RiAdminFill } from "react-icons/ri";
import { IoSearchSharp } from "react-icons/io5";
import './Navbar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products from API
  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      const products = data.products || data || [];
      setSearchResults(products.slice(0, 5));
      setShowSuggestions(products.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchProducts(searchQuery);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selected = searchResults[selectedIndex];
        if (selected) {
          handleSuggestionClick(selected);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, searchResults, selectedIndex]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSearchQuery('');
    navigate(`/product/${product.id}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartItemCount = items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? 
          <span key={index} className="highlight">{part}</span> : part
      );
    } catch {
      return text;
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      {!isAuthenticated && showAnnouncement && (
        <div className="announcement-bar">
          <div className="container announcement-container">
            <p className="announcement-text">
              Sign up and get 20% off to your first order.{' '}
              <Link to="/register" className="announcement-link">
                Sign Up Now
              </Link>
            </p>
            <button 
              className="announcement-close"
              onClick={() => setShowAnnouncement(false)}
              aria-label="Close announcement"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="logo">
              SHOP.CO
            </Link>

            <div className="nav-links">
              <Link to="/products">Shop</Link>
              <Link to="/products?filter=onsale">On Sale</Link>
              <Link to="/products?filter=new">New Arrivals</Link>
              <Link to="/brands">Brands</Link>
            </div>

            <div className="search-wrapper" ref={searchRef}>
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  ref={inputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  autoComplete="off"
                />
                <button type="submit" className="search-submit">
                  {isSearching ? '⏳' : <IoSearchSharp />}
                </button>
              </form>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="search-suggestions">
                  {searchResults.map((product, index) => (
                    <div 
                      key={product.id} 
                      className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(product)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="suggestion-image"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                      />
                      <div className="suggestion-info">
                        <div className="suggestion-title">
                          {highlightMatch(product.title || product.name, searchQuery)}
                        </div>
                        <div className="suggestion-price">${product.price}</div>
                        {product.category && (
                          <div className="suggestion-category">{product.category}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="suggestion-footer">
                    <span>{searchResults.length} results found</span>
                    <button 
                      className="view-all-btn"
                      onClick={() => {
                        setShowSuggestions(false);
                        setSelectedIndex(-1);
                        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                      }}
                    >
                      View All Results →
                    </button>
                  </div>
                </div>
              )}

              {/* No Results */}
              {showSuggestions && searchResults.length === 0 && searchQuery && !isSearching && (
                <div className="search-suggestions no-results">
                  <div className="no-results-content">
                    <span className="no-results-icon"><IoSearchSharp /></span>
                    <p>No products found for <strong>"{searchQuery}"</strong></p>
                    <p className="no-results-hint">Try searching with different keywords</p>
                  </div>
                </div>
              )}
            </div>

            <div className="nav-actions">
              <Link to="/cart" className="cart-btn">
                🛒 {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
              </Link>
              {isAuthenticated ? (
                <div className="user-menu">
                  <button className="user-btn">
                    <RiAdminFill /> {user?.name?.split(' ')[0] || 'User'}
                  </button>
                  <div className="dropdown">
                    <Link to="/profile">My Profile</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/wishlist">Wishlist</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="admin-link">
                        <RiAdminFill /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="login-btn">
                  <RiAdminFill /> Login
                </Link>
              )}
            </div>

            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ☰
            </button>
          </div>

          {isMenuOpen && (
            <div className="mobile-menu">
              <Link to="/products">Shop</Link>
              <Link to="/products?filter=onsale">On Sale</Link>
              <Link to="/products?filter=new">New Arrivals</Link>
              <Link to="/brands">Brands</Link>
              <div className="mobile-search">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit"><IoSearchSharp /></button>
                </form>
              </div>
              {isAuthenticated ? (
                <>
                  <Link to="/profile">My Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/wishlist">Wishlist</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="admin-link">
                      <RiAdminFill /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="mobile-logout">Logout</button>
                </>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;