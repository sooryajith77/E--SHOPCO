








import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist || { items: [] });
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    if (wishlistItems && product) {
      const exists = wishlistItems.some(item => item.id === product.id);
      setIsInWishlist(exists);
    }
  }, [wishlistItems, product]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      if (window.confirm('Please login to add items to your wishlist. Would you like to login now?')) {
        window.location.href = '/login';
      }
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  // Calculate discount percentage
  const discountPercentage = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image-wrapper">
          <div className="product-image">
            <img src={product.image} alt={product.title} />
          </div>
          
          {/* Badges */}
          <div className="product-badges">
            {product.isNewArrival && (
              <span className="badge-new">NEW</span>
            )}
            {product.isOnSale && discountPercentage > 0 && (
              <span className="badge-sale">SALE</span>
            )}
            {product.stock <= 0 && (
              <span className="badge-sold-out">SOLD OUT</span>
            )}
          </div>

          {/* Wishlist Button */}
          <button 
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill={isInWishlist ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        
        <h3 className="product-title">{product.title}</h3>
        
        <div className="product-rating">
          <span className="stars">★★★★★</span>
          <span className="rating-count">({product.rating?.count || 0})</span>
        </div>
        
        <div className="product-price">
          <span className="current-price">${product.price}</span>
          {product.oldPrice && (
            <>
              <span className="old-price">${product.oldPrice}</span>
              <span className="discount">-{discountPercentage}%</span>
            </>
          )}
        </div>
      </Link>
      
      <button 
        onClick={handleAddToCart} 
        className="add-to-cart-btn"
        disabled={product.stock <= 0}
      >
        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>

      <style jsx>{`
        .product-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          color: #1a1a1a;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.10);
          border-color: #e0e0e0;
        }

        .product-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-image-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          overflow: hidden;
          background: #f8f9fa;
          border-radius: 16px 16px 0 0;
        }

        .product-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        /* Badges */
        .product-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 5;
        }

        .badge-new,
        .badge-sale,
        .badge-sold-out {
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border-radius: 4px;
          color: white;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }

        .badge-new {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .badge-sale {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .badge-sold-out {
          background: linear-gradient(135deg, #4a4a4a 0%, #1a1a1a 100%);
        }

        /* Wishlist Button */
        .wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
          padding: 8px;
        }

        .wishlist-btn svg {
          width: 20px;
          height: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .wishlist-btn {
          color: #8c8c8c;
        }

        .wishlist-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          background: rgba(255, 255, 255, 1);
        }

        .wishlist-btn:active {
          transform: scale(0.92);
        }

        .wishlist-btn.active {
          color: #ff3b30;
        }

        .wishlist-btn.active svg {
          fill: #ff3b30;
        }

        .wishlist-btn.active:hover {
          transform: scale(1.1);
          color: #d32f2f;
        }

        .product-title {
          padding: 16px 16px 6px;
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
          color: #1a1a1a;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 48px;
        }

        .product-rating {
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stars {
          color: #ffc107;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .rating-count {
          color: #8c8c8c;
          font-size: 14px;
        }

        .product-price {
          padding: 6px 16px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .current-price {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .old-price {
          text-decoration: line-through;
          color: #b0b0b0;
          font-size: 14px;
        }

        .discount {
          color: #ff3b30;
          font-weight: 700;
          font-size: 13px;
          background: #fff0ee;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .add-to-cart-btn {
          margin: 0 16px 16px;
          padding: 12px;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width:260px
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: #000000;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.20);
        }

        .add-to-cart-btn:active:not(:disabled) {
          transform: scale(0.96);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #8c8c8c;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .product-title {
            font-size: 15px;
            min-height: 44px;
          }
          .current-price {
            font-size: 18px;
          }
        }

        @media (max-width: 768px) {
          .product-card {
            border-radius: 12px;
          }

          .product-image-wrapper {
            padding-bottom: 85%;
            border-radius: 12px 12px 0 0;
          }

          .product-title {
            padding: 12px 12px 4px;
            font-size: 14px;
            min-height: 40px;
          }

          .product-rating {
            padding: 0 12px;
          }

          .stars {
            font-size: 13px;
          }

          .rating-count {
            font-size: 13px;
          }

          .product-price {
            padding: 4px 12px 12px;
          }

          .current-price {
            font-size: 17px;
          }

          .old-price {
            font-size: 13px;
          }

          .discount {
            font-size: 12px;
          }

          .add-to-cart-btn {
            margin: 0 12px 12px;
            padding: 10px;
            font-size: 13px;
          }

          .wishlist-btn {
            width: 36px;
            height: 36px;
            top: 10px;
            right: 10px;
            padding: 7px;
          }

          .wishlist-btn svg {
            width: 18px;
            height: 18px;
          }

          .badge-new,
          .badge-sale,
          .badge-sold-out {
            font-size: 10px;
            padding: 3px 10px;
          }
        }

        @media (max-width: 480px) {
          .product-card {
            border-radius: 10px;
          }

          .product-image-wrapper {
            padding-bottom: 75%;
            border-radius: 10px 10px 0 0;
          }

          .product-title {
            padding: 10px 10px 4px;
            font-size: 13px;
            min-height: 36px;
          }

          .product-rating {
            padding: 0 10px;
          }

          .stars {
            font-size: 12px;
          }

          .rating-count {
            font-size: 12px;
          }

          .product-price {
            padding: 4px 10px 10px;
            gap: 6px;
          }

          .current-price {
            font-size: 15px;
          }

          .old-price {
            font-size: 12px;
          }

          .discount {
            font-size: 11px;
            padding: 1px 6px;
          }

          .add-to-cart-btn {
            margin: 0 10px 10px;
            padding: 8px;
            font-size: 12px;
            border-radius: 8px;
          }

          .wishlist-btn {
            width: 32px;
            height: 32px;
            top: 8px;
            right: 8px;
            padding: 6px;
          }

          .wishlist-btn svg {
            width: 16px;
            height: 16px;
          }

          .product-badges {
            top: 8px;
            left: 8px;
            gap: 4px;
          }

          .badge-new,
          .badge-sale,
          .badge-sold-out {
            font-size: 9px;
            padding: 2px 8px;
          }
        }

        @media (max-width: 360px) {
          .product-title {
            font-size: 12px;
            min-height: 32px;
          }

          .current-price {
            font-size: 14px;
          }

          .add-to-cart-btn {
            font-size: 11px;
            padding: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;





// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { addToCart } from '../redux/slices/cartSlice';
// import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
// import './ProductCard.css'; // Import external CSS

// const ProductCard = ({ product }) => {
//   const dispatch = useDispatch();
//   const { items: wishlistItems } = useSelector((state) => state.wishlist || { items: [] });
//   const { isAuthenticated } = useSelector((state) => state.auth);
  
//   const [isInWishlist, setIsInWishlist] = useState(false);

//   // Check if product is in wishlist
//   useEffect(() => {
//     if (wishlistItems && product) {
//       const exists = wishlistItems.some(item => item.id === product.id);
//       setIsInWishlist(exists);
//     }
//   }, [wishlistItems, product]);

//   const handleAddToCart = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     dispatch(addToCart(product));
//   };

//   const handleWishlistToggle = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
    
//     if (!isAuthenticated) {
//       if (window.confirm('Please login to add items to your wishlist. Would you like to login now?')) {
//         window.location.href = '/login';
//       }
//       return;
//     }

//     if (isInWishlist) {
//       dispatch(removeFromWishlist(product.id));
//     } else {
//       dispatch(addToWishlist(product));
//     }
//   };

//   // Calculate discount percentage
//   const discountPercentage = product.oldPrice 
//     ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
//     : 0;

//   return (
//     <div className="product-card">
//       <Link to={`/product/${product.id}`} className="product-link">
//         <div className="product-image-wrapper">
//           <div className="product-image">
//             <img 
//               src={product.image} 
//               alt={product.title}
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = 'https://via.placeholder.com/300x300/cccccc/000000?text=Product';
//               }}
//             />
//           </div>
          
//           {/* Badges */}
//           <div className="product-badges">
//             {product.isNewArrival && (
//               <span className="badge-new">NEW</span>
//             )}
//             {product.isOnSale && discountPercentage > 0 && (
//               <span className="badge-sale">SALE</span>
//             )}
//             {product.stock <= 0 && (
//               <span className="badge-sold-out">SOLD OUT</span>
//             )}
//           </div>

//           {/* Wishlist Button */}
//           <button 
//             className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
//             onClick={handleWishlistToggle}
//             aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
//           >
//             <svg 
//               viewBox="0 0 24 24" 
//               fill={isInWishlist ? 'currentColor' : 'none'}
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
//             </svg>
//           </button>
//         </div>
        
//         <h3 className="product-title">{product.title}</h3>
        
//         <div className="product-rating">
//           <span className="stars">★★★★★</span>
//           <span className="rating-count">({product.rating?.count || 0})</span>
//         </div>
        
//         <div className="product-price">
//           <span className="current-price">${product.price}</span>
//           {product.oldPrice && (
//             <>
//               <span className="old-price">${product.oldPrice}</span>
//               <span className="discount">-{discountPercentage}%</span>
//             </>
//           )}
//         </div>
//       </Link>
      
//       <button 
//         onClick={handleAddToCart} 
//         className="add-to-cart-btn"
//         disabled={product.stock <= 0}
//       >
//         {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
//       </button>
//     </div>
//   );
// };

// export default ProductCard;