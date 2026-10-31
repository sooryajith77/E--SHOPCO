



// pages/Wishlist.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, clearWishlist } from '../redux/slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Wishlist.css'
const Wishlist = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading, error } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [isAuthenticated, dispatch]);

  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (!isAuthenticated) {
    return (
      <div className="wishlist-login-container">
        <div className="wishlist-login-card">
          <FaHeart className="login-icon" />
          <h2>Your Wishlist is Waiting!</h2>
          <p>Please login to view and manage your wishlist items.</p>
          <Link to="/login" className="login-btn">
            Login Now
          </Link>
          <Link to="/" className="continue-shopping-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !wishlistItems.length) {
    return (
      <div className="wishlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>
          <FaHeart className="header-icon" />
          My Wishlist
        </h1>
        <span className="wishlist-count">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <FaHeart className="empty-icon" />
          <h2>Your wishlist is empty</h2>
          <p>Start adding your favorite products to your wishlist!</p>
          <Link to="/products" className="browse-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

     
    </div>
  );
};

export default Wishlist;