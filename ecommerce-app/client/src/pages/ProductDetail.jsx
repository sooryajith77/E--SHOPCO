



import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../components/Loader';
import './Productdetail.css'

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProduct, loading, products = [] } = useSelector((state) => state.products);
  const { orders = [] } = useSelector((state) => state.orders || { orders: [] });
  
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [selectedColor, setSelectedColor] = useState('dark');
  const [activeTab, setActiveTab] = useState('product-details');
  const [visibleReviews, setVisibleReviews] = useState(4);
  const [reviewSort, setReviewSort] = useState('latest');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adminView, setAdminView] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [similarProducts, setSimilarProducts] = useState([]);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [orderDetails, setOrderDetails] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedProduct && selectedProduct.category) {
      fetchSimilarProducts(selectedProduct.category, selectedProduct.id);
    }
  }, [selectedProduct]);

  const fetchSimilarProducts = async (category, currentProductId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products?category=${category}&limit=4`);
      if (response.ok) {
        const data = await response.json();
        if (data.products) {
          let filtered = data.products.filter(p => p.id !== currentProductId);
          const shuffled = [...filtered].sort(() => 0.5 - Math.random());
          setSimilarProducts(shuffled.slice(0, 4));
          return;
        }
      }
      throw new Error('API fetch failed');
    } catch (error) {
      generateMockSimilarProducts(category, currentProductId);
    }
  };

  const generateMockSimilarProducts = (category, currentProductId) => {
    const mockProducts = [
      { id: 101, name: 'Classic T-Shirt', price: 29.99, originalPrice: 39.99, image: 'https://picsum.photos/200/200?random=1', category: category, discount: 25 },
      { id: 102, name: 'Premium Hoodie', price: 49.99, originalPrice: 69.99, image: 'https://picsum.photos/200/200?random=2', category: category, discount: 29 },
      { id: 103, name: 'Slim Fit Jeans', price: 39.99, image: 'https://picsum.photos/200/200?random=3', category: category },
      { id: 104, name: 'Casual Jacket', price: 59.99, originalPrice: 79.99, image: 'https://picsum.photos/200/200?random=4', category: category, discount: 25 },
    ];
    const filtered = mockProducts.filter(p => p.id !== currentProductId);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setSimilarProducts(shuffled.slice(0, 4));
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      dispatch(addToCart({ ...selectedProduct, selectedSize, selectedColor, quantity }));
      toast.success('🛒 Added to cart successfully!');
    }
  };

  useEffect(() => {
    if (showOrderModal) {
      fetchSavedAddresses();
    }
  }, [showOrderModal]);

  const fetchSavedAddresses = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    setLoadingAddresses(true);
    try {
      const response = await fetch('http://localhost:5000/api/addresses', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSavedAddresses(data.addresses);
        const defaultAddr = data.addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          populateOrderForm(defaultAddr);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch saved addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const populateOrderForm = (address) => {
    setOrderDetails({
      fullName: address.fullName,
      email: address.email,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
      paymentMethod: 'cod'
    });
  };

  const handleAddressSelect = (addressId) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      populateOrderForm(address);
      toast.success('Address selected');
    }
  };

  const saveAddressAfterOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const addressExists = savedAddresses.some(addr => 
      addr.address === orderDetails.address && 
      addr.city === orderDetails.city &&
      addr.zipCode === orderDetails.zipCode
    );
    
    if (addressExists) return;
    
    try {
      await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          fullName: orderDetails.fullName,
          email: orderDetails.email,
          phone: orderDetails.phone,
          address: orderDetails.address,
          city: orderDetails.city,
          state: orderDetails.state,
          zipCode: orderDetails.zipCode,
          isDefault: savedAddresses.length === 0,
          addressType: 'home'
        })
      });
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleBuyNow = () => {
    setShowOrderModal(true);
  };

  const handleOrderChange = (e) => {
    setOrderDetails({
      ...orderDetails,
      [e.target.name]: e.target.value
    });
  };

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      toast.warning('Please login first');
      navigate('/login');
      return;
    }
    
    const totalPrice = selectedProduct.price * quantity;
    const toastId = toast.loading('Placing your order...');
    
    const orderData = {
      fullName: orderDetails.fullName,
      email: orderDetails.email,
      phone: orderDetails.phone,
      address: orderDetails.address,
      city: orderDetails.city,
      state: orderDetails.state,
      zipCode: orderDetails.zipCode,
      paymentMethod: orderDetails.paymentMethod,
      shippingAddress: `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state} ${orderDetails.zipCode}`,
      items: [{
        productId: selectedProduct.id,
        quantity: quantity,
        price: selectedProduct.price,
        size: selectedSize,
        color: selectedColor
      }]
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.update(toastId, {
          render: `✅ Order placed successfully!\n📦 Order ID: ${data.order?.orderId || data.order?.id}\n🔍 Tracking ID: ${data.trackingId}\n💰 Total: $${totalPrice.toFixed(2)}`,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });
        
        setShowOrderModal(false);
        
        setOrderDetails({
          fullName: '',
          email: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          paymentMethod: 'cod'
        });
        setQuantity(1);
        
        setTimeout(() => {
          navigate('/orders');
        }, 1500);
      } else {
        toast.update(toastId, {
          render: `❌ ${data.message || 'Order failed. Please try again.'}`,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: '❌ Failed to place order. Make sure backend is running on port 5000',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleTrackOrder = () => {
    if (!trackingId) {
      toast.warning('⚠️ Please enter tracking ID');
      return;
    }
    
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = existingOrders.find(o => o.trackingId === trackingId);
    
    if (order) {
      setTrackedOrder(order);
      toast.success('✅ Order found!');
    } else {
      toast.error('❌ Order not found. Please check your tracking ID.');
      setTrackedOrder(null);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = existingOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      existingOrders[orderIndex].status = newStatus;
      existingOrders[orderIndex].statusHistory.push({
        status: newStatus,
        date: new Date().toISOString(),
        note: `Order status updated to ${newStatus}`
      });
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      toast.success(`✅ Order status updated to ${newStatus}`);
      if (trackedOrder && trackedOrder.id === orderId) {
        setTrackedOrder(existingOrders[orderIndex]);
      }
    }
  };

  const deleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const filteredOrders = existingOrders.filter(o => o.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(filteredOrders));
      toast.success('🗑️ Order deleted successfully');
      if (trackedOrder && trackedOrder.id === orderId) {
        setTrackedOrder(null);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ff9800';
      case 'processing': return '#2196f3';
      case 'shipped': return '#4caf50';
      case 'delivered': return '#00bcd4';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const loadMoreReviews = () => {
    setVisibleReviews(prev => prev + 3);
    toast.info('Loading more reviews...');
  };

  if (loading) return <Loader />;
  if (!selectedProduct) return <div className="not-found">Product not found</div>;

  const allReviews = [
    { id: 1, name: "Samantha D.", date: "Posted on August 14, 2023", rating: 4.5, text: "Absolutely love this shirt! The design is unique and the fabric feels so comfortable." },
    { id: 2, name: "Alex M.", date: "Posted on August 6, 2023", rating: 5, text: "The shirt exceeded my expectations! The quality is top notch." },
    { id: 3, name: "Ethan R.", date: "Posted on August 16, 2023", rating: 5, text: "This t-shirt is a must-have for anyone who appreciates good design." },
    { id: 4, name: "Olivia P.", date: "Posted on August 17, 2023", rating: 5, text: "I love this shirt! It looks super comfy and versatile." },
    { id: 5, name: "Liam K.", date: "Posted on August 18, 2023", rating: 5, text: "This t-shirt is a piece of contemporary art." },
    { id: 6, name: "Ava H.", date: "Posted on August 19, 2023", rating: 5, text: "I'm really impressed with how well-designed this shirt is!" }
  ];

  const getSortedReviews = () => {
    const sorted = [...allReviews];
    switch(reviewSort) {
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted.sort((a, b) => new Date(b.date.split(' ')[2]) - new Date(a.date.split(' ')[2]));
    }
  };

  const sortedReviews = getSortedReviews();
  const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const filteredOrders = orderFilter === 'all' ? existingOrders : existingOrders.filter(o => o.status === orderFilter);

  const handleSimilarProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="product-detail-page">
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

      <div className="breadcrumb">
        <div className="container">
          <span>Shop</span> &gt; <span>{selectedProduct.category || 'Products'}</span> &gt; <span>{selectedProduct.title || selectedProduct.name}</span>
        </div>
      </div>

      <div className="container">
        <div className="product-detail-content">
          <div className="product-gallery">
            <div className="main-image">
              <img src={selectedProduct.image} alt={selectedProduct.title} />
            </div>
            <div className="thumbnail-list">
              <div className={`thumbnail ${selectedColor === 'dark' ? 'active' : ''}`} onClick={() => setSelectedColor('dark')}>
                <img src={selectedProduct.image} alt="thumb 1" />
              </div>
              <div className={`thumbnail ${selectedColor === 'brown' ? 'active' : ''}`} onClick={() => setSelectedColor('brown')}>
                <img src={selectedProduct.image} alt="thumb 2" />
              </div>
              <div className={`thumbnail ${selectedColor === 'green' ? 'active' : ''}`} onClick={() => setSelectedColor('green')}>
                <img src={selectedProduct.image} alt="thumb 3" />
              </div>
            </div>
          </div>
          
          <div className="product-info">
            <h1>{selectedProduct.title || selectedProduct.name}</h1>
            <div className="rating">
              <span className="stars">★★★★☆</span>
              <span className="rating-value">4.5/5</span>
            </div>
            <div className="price-section">
              <span className="current-price">${selectedProduct.price}</span>
              {selectedProduct.originalPrice && (
                <>
                  <span className="original-price">${selectedProduct.originalPrice}</span>
                  <span className="discount-badge">-{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}%</span>
                </>
              )}
            </div>
            <p className="description">
              {selectedProduct.description || "The graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style."}
            </p>
            
            <div className="option-section">
              <label>Colors</label>
              <div className="color-options">
                <button className={`color-btn ${selectedColor === 'dark' ? 'active' : ''}`} style={{ backgroundColor: '#2d2d2d' }} onClick={() => setSelectedColor('dark')}></button>
                <button className={`color-btn ${selectedColor === 'brown' ? 'active' : ''}`} style={{ backgroundColor: '#8B4513' }} onClick={() => setSelectedColor('brown')}></button>
                <button className={`color-btn ${selectedColor === 'green' ? 'active' : ''}`} style={{ backgroundColor: '#4a6741' }} onClick={() => setSelectedColor('green')}></button>
              </div>
            </div>

            <div className="option-section">
              <label>Size</label>
              <div className="size-options">
                {['Small', 'Medium', 'Large', 'X-Large'].map(size => (
                  <button key={size} className={`size-btn ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-section">
              <label>Quantity</label>
              <div className="quantity-selector">
                <button className="qty-btn" onClick={decrementQuantity}>-</button>
                <span className="quantity">{quantity}</span>
                <button className="qty-btn" onClick={incrementQuantity}>+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} className="add-to-cart-btn">Add to Cart</button>
            <button onClick={handleBuyNow} className="buy-btn">Buy Now</button>
          </div>
        </div>

        <div className="tabs-section">
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'product-details' ? 'active' : ''}`} onClick={() => setActiveTab('product-details')}>Product Details</button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Rating & Reviews</button>
            <button className={`tab-btn ${activeTab === 'faqs' ? 'active' : ''}`} onClick={() => setActiveTab('faqs')}>FAQs</button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'product-details' && (
              <div className="product-details-tab">
                <p>{selectedProduct.detailedDescription || "Detailed product information goes here. Crafted from premium quality materials, this product offers exceptional comfort and durability."}</p>
                <ul>
                  <li>100% Premium quality materials</li>
                  <li>Machine wash cold</li>
                  <li>Premium quality finish</li>
                  <li>Regular fit</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <div className="reviews-header">
                  <h3>All Reviews ({allReviews.length})</h3>
                  <div className="reviews-sort">
                    <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)}>
                      <option value="latest">Latest</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                    <button className="write-review-btn">Write a review</button>
                  </div>
                </div>
                <div className="reviews-list">
                  {sortedReviews.slice(0, visibleReviews).map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <h4>{review.name}</h4>
                          <div className="review-rating">
                            {'★'.repeat(Math.floor(review.rating))}{'☆'.repeat(5 - Math.floor(review.rating))}
                            <span className="rating-number">{review.rating}/5</span>
                          </div>
                        </div>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <p className="review-text">{review.text}</p>
                    </div>
                  ))}
                </div>
                {visibleReviews < sortedReviews.length && (
                  <button onClick={loadMoreReviews} className="load-more-btn">Load More Reviews</button>
                )}
              </div>
            )}
            
            {activeTab === 'faqs' && (
              <div className="faqs-tab">
                <div className="faq-item">
                  <h4>What is the return policy?</h4>
                  <p>We offer 30-day returns on all unworn items with original tags attached.</p>
                </div>
                <div className="faq-item">
                  <h4>How do I care for this product?</h4>
                  <p>Machine wash cold with like colors, tumble dry low, do not bleach.</p>
                </div>
                <div className="faq-item">
                  <h4>What sizes are available?</h4>
                  <p>Small, Medium, Large, and X-Large are available.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="similar-products">
          <h2>YOU MIGHT ALSO LIKE</h2>
          {similarProducts.length > 0? (
            <div className="similar-grid">
              {similarProducts.slice(0,4).map(product => (
                <div key={product.id} className="similar-card" onClick={() => handleSimilarProductClick(product.id)}>
                  <img src={product.image} alt={product.name} />
                  <h4>{product.name}</h4>
                  <div className="price-row">
                    <span className="price">${product.price}</span>
                    {product.originalPrice && product.originalPrice !== product.price && (
                      <>
                        <span className="original-price">${product.originalPrice}</span>
                        {product.discount && <span className="discount">-{product.discount}%</span>}
                      </>
                    )}
                  </div>
                  {product.category && <div className="category-badge">{product.category}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading similar products...</p>
            </div>
          )}
        </div>
      </div>

      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Complete Your Order</h2>
              <button className="modal-close" onClick={() => setShowOrderModal(false)}>&times;</button>
            </div>
            
            {savedAddresses.length > 0 && (
              <div className="saved-addresses">
                <h4>Select Saved Address</h4>
                <div className="address-list">
                  {savedAddresses.map(addr => (
                    <div 
                      key={addr.id} 
                      className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      onClick={() => handleAddressSelect(addr.id)}
                    >
                      <div className="address-radio">
                        <input 
                          type="radio" 
                          checked={selectedAddressId === addr.id}
                          onChange={() => handleAddressSelect(addr.id)}
                        />
                      </div>
                      <div className="address-details">
                        <p><strong>{addr.fullName}</strong> {addr.isDefault && <span className="default-badge">Default</span>}</p>
                        <p>{addr.address}</p>
                        <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p>📞 {addr.phone} | 📧 {addr.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  className="new-address-btn"
                  onClick={() => {
                    setSelectedAddressId(null);
                    setOrderDetails({
                      fullName: '',
                      email: '',
                      address: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      phone: '',
                      paymentMethod: 'cod'
                    });
                  }}
                >
                  + Use New Address
                </button>
              </div>
            )}
            
            <form onSubmit={async (e) => {
              await handleOrderSubmit(e);
              await saveAddressAfterOrder();
            }}>
              <input type="text" name="fullName" placeholder="Full Name" required onChange={handleOrderChange} value={orderDetails.fullName} />
              <input type="email" name="email" placeholder="Email Address" required onChange={handleOrderChange} value={orderDetails.email} />
              <input type="text" name="address" placeholder="Street Address" required onChange={handleOrderChange} value={orderDetails.address} />
              <div className="form-row">
                <input type="text" name="city" placeholder="City" required onChange={handleOrderChange} value={orderDetails.city} />
                <input type="text" name="state" placeholder="State" required onChange={handleOrderChange} value={orderDetails.state} />
                <input type="text" name="zipCode" placeholder="Zip Code" required onChange={handleOrderChange} value={orderDetails.zipCode} />
              </div>
              <input type="tel" name="phone" placeholder="Phone Number" required onChange={handleOrderChange} value={orderDetails.phone} />
              <select name="paymentMethod" onChange={handleOrderChange} value={orderDetails.paymentMethod}>
                <option value="cod">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
              </select>
              
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-item"><span>{selectedProduct.title || selectedProduct.name}</span><span>${selectedProduct.price}</span></div>
                <div className="summary-item"><span>Quantity:</span><span>{quantity}</span></div>
                <div className="summary-item"><span>Size:</span><span>{selectedSize}</span></div>
                <div className="summary-item"><span>Color:</span><span>{selectedColor}</span></div>
                <div className="summary-total"><strong>Total:</strong><strong>${(selectedProduct.price * quantity).toFixed(2)}</strong></div>
              </div>
              
              <button type="submit" className="confirm-order-btn">Place Order</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;