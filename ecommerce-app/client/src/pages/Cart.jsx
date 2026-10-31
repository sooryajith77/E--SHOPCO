


// Cart.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items || []);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
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

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Fetch saved addresses when modal opens
  useEffect(() => {
    if (showOrderModal) {
      fetchSavedAddresses();
    }
  }, [showOrderModal]);

  const fetchSavedAddresses = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.info('Please login to access saved addresses');
      return;
    }
    
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
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const populateOrderForm = (address) => {
    setOrderDetails({
      fullName: address.fullName || '',
      email: address.email || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      phone: address.phone || '',
      paymentMethod: orderDetails.paymentMethod || 'cod'
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

  const handleOrderChange = (e) => {
    setOrderDetails({
      ...orderDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
    toast.info('Item removed from cart');
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toast.info('Cart cleared');
    }
  };

  const handleBuyNow = () => {
    if (cartItems.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }
    setShowOrderModal(true);
  };

  const saveAddressAfterOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Check if address already exists
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
      console.error('Failed to save address:', error);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      toast.warning('Please login first');
      navigate('/login');
      return;
    }
    
    setLoading(true);
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
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.title || item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize || 'N/A',
        color: item.selectedColor || 'N/A',
        image: item.image
      })),
      totalAmount: total
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
          render: `✅ Order placed successfully!\n📦 Order ID: ${data.order?.orderId || data.order?.id}\n🔍 Tracking ID: ${data.trackingId}\n💰 Total: $${total.toFixed(2)}`,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });
        
        // Save address if user wants to
        await saveAddressAfterOrder();
        
        // Clear cart after successful order
        dispatch(clearCart());
        setShowOrderModal(false);
        
        // Reset form
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
        
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
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
        render: '❌ Failed to place order. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <ToastContainer />
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
    

      <div className="cart-container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img 
                    src={item.image || 'https://via.placeholder.com/100'} 
                    alt={item.title || item.name} 
                  />
                </div>
                
                <div className="cart-item-details">
                  <h3>{item.title || item.name}</h3>
                  <div className="cart-item-meta">
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                  </div>
                  <div className="cart-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <button 
              className="checkout-btn"
              onClick={handleBuyNow}
            >
              Proceed to Checkout
            </button>
            
            <button 
              className="clear-cart-btn"
              onClick={handleClearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Complete Your Order</h2>
              <button className="modal-close" onClick={() => setShowOrderModal(false)}>&times;</button>
            </div>
            
            {loadingAddresses ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="loading-spinner" />
                <p>Loading saved addresses...</p>
              </div>
            ) : (
              <>
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
                
                <form onSubmit={handleOrderSubmit}>
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="fullName" 
                      placeholder="Full Name" 
                      required 
                      onChange={handleOrderChange} 
                      value={orderDetails.fullName} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Email Address" 
                      required 
                      onChange={handleOrderChange} 
                      value={orderDetails.email} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="address" 
                      placeholder="Street Address" 
                      required 
                      onChange={handleOrderChange} 
                      value={orderDetails.address} 
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <input 
                        type="text" 
                        name="city" 
                        placeholder="City" 
                        required 
                        onChange={handleOrderChange} 
                        value={orderDetails.city} 
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="text" 
                        name="state" 
                        placeholder="State" 
                        required 
                        onChange={handleOrderChange} 
                        value={orderDetails.state} 
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="text" 
                        name="zipCode" 
                        placeholder="Zip Code" 
                        required 
                        onChange={handleOrderChange} 
                        value={orderDetails.zipCode} 
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="Phone Number" 
                      required 
                      onChange={handleOrderChange} 
                      value={orderDetails.phone} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <select 
                      name="paymentMethod" 
                      onChange={handleOrderChange} 
                      value={orderDetails.paymentMethod}
                    >
                      <option value="cod">Cash on Delivery</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div className="order-summary-modal">
                    <h3>Order Summary</h3>
                    {cartItems.map(item => (
                      <div key={item.id} className="summary-item">
                        <span>{item.title || item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="summary-divider" />
                    <div className="summary-item total">
                      <strong>Total</strong>
                      <strong>${total.toFixed(2)}</strong>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="confirm-order-btn"
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : `Place Order ($${total.toFixed(2)})`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;