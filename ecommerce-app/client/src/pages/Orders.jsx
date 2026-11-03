

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Order.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelOrderNumber, setCancelOrderNumber] = useState('');
  const [cancelProductName, setCancelProductName] = useState('');

  const getToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.token || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = getToken();

      if (token) {
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();

          let ordersData = [];
          if (data.orders) {
            ordersData = data.orders;
          } else if (data.data) {
            ordersData = data.data;
          } else if (Array.isArray(data)) {
            ordersData = data;
          }

          const processedOrders = ordersData.map(order => ({
            ...order,
            created_at: order.created_at || order.createdAt || order.orderDate || new Date().toISOString(),
            order_number: order.order_number || order.orderId || order.id,
            tracking_number: order.tracking_number || order.trackingId || order.trackingNumber || 'N/A',
            items: order.items || order.OrderItems || order.orderItems || [],
            product: order.product || (order.items && order.items.length > 0 ? order.items[0] : null),
            status: order.status || 'pending',
            total_amount: parseFloat(order.total_amount) || 0,
            totalPrice: parseFloat(order.totalPrice) || 0,
            total: parseFloat(order.total) || 0
          }));

          setOrders(processedOrders);
          setLoading(false);
          return;
        }
      }

      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status?.toLowerCase());
  };

  const getStatusMessage = (order) => {
    const status = order.status?.toLowerCase();
    const date = formatShortDate(order.created_at);
    switch (status) {
      case 'delivered':
        return { text: `Delivered ${date}`, tone: 'delivered' };
      case 'shipped':
        return { text: 'Shipped, arriving soon', tone: 'shipped' };
      case 'processing':
        return { text: 'Preparing your order', tone: 'processing' };
      case 'cancelled':
        return { text: 'Order cancelled', tone: 'cancelled' };
      default:
        return { text: 'Order placed', tone: 'pending' };
    }
  };

  const getProductName = (order) => {
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      return firstItem.productName || firstItem.name || firstItem.title || 'Product';
    }
    if (order.OrderItems && order.OrderItems.length > 0) {
      const firstItem = order.OrderItems[0];
      return firstItem.product?.name || firstItem.product?.title || firstItem.name || 'Product';
    }
    if (order.product) {
      return order.product.name || order.product.title || 'Product';
    }
    if (order.product_name) return order.product_name;
    if (order.productName) return order.productName;
    if (order.title) return order.title;
    if (order.name) return order.name;

    const itemCount = order.items?.length || order.OrderItems?.length || 0;
    if (itemCount > 1) {
      return `${itemCount} items`;
    }

    return `Order #${order.order_number || order.id}`;
  };

  const getExtraItemsCount = (order) => {
    const itemCount = order.items?.length || order.OrderItems?.length || 0;
    return itemCount > 1 ? itemCount - 1 : 0;
  };

  const getProductImage = (order) => {
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      if (firstItem.image) return firstItem.image;
      if (firstItem.productImage) return firstItem.productImage;
      if (firstItem.product?.image) return firstItem.product.image;
      if (firstItem.product?.images && firstItem.product.images.length > 0) {
        return firstItem.product.images[0];
      }
    }

    if (order.OrderItems && order.OrderItems.length > 0) {
      const firstItem = order.OrderItems[0];
      if (firstItem.image) return firstItem.image;
      if (firstItem.productImage) return firstItem.productImage;
      if (firstItem.product?.image) return firstItem.product.image;
      if (firstItem.product?.images && firstItem.product.images.length > 0) {
        return firstItem.product.images[0];
      }
    }

    if (order.product) {
      if (order.product.image) return order.product.image;
      if (order.product.images && order.product.images.length > 0) {
        return order.product.images[0];
      }
    }

    if (order.image) return order.image;
    if (order.product_image) return order.product_image;
    if (order.productImage) return order.productImage;
    if (order.images && order.images.length > 0) return order.images[0];

    if (order.product_id) {
      return `https://via.placeholder.com/100?text=Product+${order.product_id}`;
    }

    const productName = getProductName(order);
    return `https://via.placeholder.com/100?text=${encodeURIComponent(productName.substring(0, 10))}`;
  };

  const getProductPrice = (order) => {
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      return parseFloat(firstItem.price || firstItem.unitPrice || 0);
    }
    if (order.OrderItems && order.OrderItems.length > 0) {
      const firstItem = order.OrderItems[0];
      return parseFloat(firstItem.price || firstItem.unitPrice || 0);
    }
    if (order.product) {
      return parseFloat(order.product.price || 0);
    }
    return parseFloat(order.price || order.unit_price || 0);
  };

  const getProductSize = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items[0].size || 'N/A';
    }
    if (order.OrderItems && order.OrderItems.length > 0) {
      return order.OrderItems[0].size || 'N/A';
    }
    return order.size || 'N/A';
  };

  const getProductColor = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items[0].color || 'N/A';
    }
    if (order.OrderItems && order.OrderItems.length > 0) {
      return order.OrderItems[0].color || 'N/A';
    }
    return order.color || 'N/A';
  };

  const getProductQuantity = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items[0].quantity || 1;
    }
    if (order.OrderItems && order.OrderItems.length > 0) {
      return order.OrderItems[0].quantity || 1;
    }
    return order.quantity || 1;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const getOrderTotal = (order) => {
    const total = parseFloat(order.total_amount) ||
                  parseFloat(order.totalPrice) ||
                  parseFloat(order.total) ||
                  (parseFloat(getProductPrice(order)) * parseInt(getProductQuantity(order))) ||
                  0;
    return total;
  };

  const openCancelModal = (order) => {
    const productName = getProductName(order);
    setCancelOrderId(order.id);
    setCancelOrderNumber(order.order_number || order.orderId || order.id);
    setCancelProductName(productName);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelOrderId(null);
    setCancelOrderNumber('');
    setCancelProductName('');
  };

  const processCancelOrder = async () => {
    if (!cancelOrderId) return;

    closeCancelModal();

    const toastId = toast.loading('Cancelling order...');

    try {
      const token = getToken();
      if (token) {
        const response = await fetch(`${API_URL}/orders/${cancelOrderId}/cancel`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await fetchOrders();
          toast.update(toastId, {
            render: `Order for "${cancelProductName}" cancelled`,
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });
          return;
        }
      }

      const updatedOrders = orders.map(order => {
        if (order.id === cancelOrderId && (order.status === 'pending' || order.status === 'processing')) {
          return {
            ...order,
            status: 'cancelled',
            statusHistory: [
              ...(order.statusHistory || []),
              {
                status: 'cancelled',
                date: new Date().toISOString(),
                note: 'Order cancelled by customer'
              }
            ]
          };
        }
        return order;
      });
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      toast.update(toastId, {
        render: `Order for "${cancelProductName}" cancelled`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: 'Failed to cancel order',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const reorder = async (order) => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

      const productToReorder = {
        id: order.product?.id || order.productId || order.id,
        title: getProductName(order),
        name: getProductName(order),
        image: getProductImage(order),
        price: getProductPrice(order),
        selectedSize: getProductSize(order),
        selectedColor: getProductColor(order),
        quantity: getProductQuantity(order)
      };

      cartItems.push(productToReorder);
      localStorage.setItem('cart', JSON.stringify(cartItems));

      toast.success('Added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleTrackOrder = () => {
    if (!trackingId) {
      toast.warning('Please enter a tracking ID');
      return;
    }

    const order = orders.find(o =>
      (o.tracking_number === trackingId) ||
      (o.trackingNumber === trackingId) ||
      (o.trackingId === trackingId)
    );

    if (order) {
      setTrackedOrder(order);
      toast.success('Order found');
    } else {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = savedOrders.find(o =>
        o.trackingId === trackingId ||
        o.trackingNumber === trackingId
      );
      if (foundOrder) {
        setTrackedOrder(foundOrder);
        toast.success('Order found');
      } else {
        toast.error('Order not found. Please check your tracking ID.');
        setTrackedOrder(null);
      }
    }
  };

  const filteredOrders = orders
    .filter(order => filter === 'all' ? true : order.status?.toLowerCase() === filter)
    .filter(order => {
      if (!searchTerm) return true;
      const name = getProductName(order).toLowerCase();
      const num = String(order.order_number || order.id || '').toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || num.includes(searchTerm.toLowerCase());
    })
    .filter(order => {
      if (dateFilter === 'all') return true;
      const orderYear = new Date(order.created_at).getFullYear();
      return String(orderYear) === dateFilter;
    });

  const getStatusCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(o => o.status?.toLowerCase() === status).length;
  };

  const availableYears = Array.from(
    new Set(orders.map(o => new Date(o.created_at).getFullYear()).filter(y => !isNaN(y)))
  ).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading your orders…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
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

      <div className="orders-topbar">
        <div className="orders-container">
          <div className="orders-topbar-inner">
            <h1>Your Orders</h1>
            <div className="orders-topbar-actions">
              
              
            </div>
          </div>
        </div>
      </div>

      <div className="orders-container">
        <div className="orders-filterbar">
          <div className="filter-pills">
            <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All <span className="pill-count">{getStatusCount('all')}</span>
            </button>
            <button className={`filter-pill ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
              Pending <span className="pill-count">{getStatusCount('pending')}</span>
            </button>
            <button className={`filter-pill ${filter === 'processing' ? 'active' : ''}`} onClick={() => setFilter('processing')}>
              Processing <span className="pill-count">{getStatusCount('processing')}</span>
            </button>
            <button className={`filter-pill ${filter === 'shipped' ? 'active' : ''}`} onClick={() => setFilter('shipped')}>
              Shipped <span className="pill-count">{getStatusCount('shipped')}</span>
            </button>
            <button className={`filter-pill ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>
              Delivered <span className="pill-count">{getStatusCount('delivered')}</span>
            </button>
            <button className={`filter-pill ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
              Cancelled <span className="pill-count">{getStatusCount('cancelled')}</span>
            </button>
          </div>

          {availableYears.length > 0 && (
            <select
              className="orders-year-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All time</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        {filteredOrders.length > 0 ? (
          <div className="orders-list">
            {filteredOrders.map(order => {
              const productName = getProductName(order);
              const productImage = getProductImage(order);
              const productQuantity = getProductQuantity(order);
              const orderTotal = getOrderTotal(order);
              const extraItems = getExtraItemsCount(order);
              const statusMsg = getStatusMessage(order);
              const step = getStatusStep(order.status);

              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-header-fields">
                      <div className="order-header-field">
                        <span className="field-label">Order placed</span>
                        <span className="field-value">{formatShortDate(order.created_at)}</span>
                      </div>
                      <div className="order-header-field">
                        <span className="field-label">Total</span>
                        <span className="field-value">${typeof orderTotal === 'number' ? orderTotal.toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="order-header-field">
                        <span className="field-label">Ship to</span>
                        <span className="field-value">{order.shipping_name || order.fullName || order.name || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="order-header-right">
                      <span className="field-label">Order # {order.order_number || order.orderId || order.id}</span>
                      <button className="link-btn" onClick={() => viewOrderDetails(order)}>View order details</button>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-item-row">
                      <img
                        src={productImage}
                        alt={productName}
                        className="order-item-image"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/100/2874f0/FFFFFF?text=${encodeURIComponent(productName.substring(0, 3))}`;
                        }}
                      />
                      <div className="order-item-info">
                        <span className={`status-pill ${getStatusBadgeClass(order.status)}`}>
                          {statusMsg.text}
                        </span>
                        <button className="order-item-title" onClick={() => viewOrderDetails(order)}>
                          {productName}
                        </button>
                        {extraItems > 0 && (
                          <span className="order-item-extra">+ {extraItems} more item{extraItems > 1 ? 's' : ''}</span>
                        )}
                        <span className="order-item-meta">Qty: {productQuantity}</span>
                      </div>

                      <div className="order-item-actions">
                        
                        <button className="btn btn-plain" onClick={() => viewOrderDetails(order)}>
                          View invoice
                        </button>
                       
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button className="btn btn-plain btn-danger-text" onClick={() => openCancelModal(order)}>
                            Cancel order
                          </button>
                        )}
                      </div>
                    </div>

                    {order.status !== 'cancelled' && (
                      <div className="order-progress">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
                        </div>
                        <div className="progress-labels">
                          <span className={step >= 0 ? 'active' : ''}>Order placed</span>
                          <span className={step >= 1 ? 'active' : ''}>Processing</span>
                          <span className={step >= 2 ? 'active' : ''}>Shipped</span>
                          <span className={step >= 3 ? 'active' : ''}>Delivered</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>
              {searchTerm || filter !== 'all' || dateFilter !== 'all'
                ? "Try changing your filters or search term."
                : "You haven't placed any orders yet. Start shopping to see your orders here."}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>Start shopping</button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={closeCancelModal}>
          <div className="modal-content cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel order</h2>
              <button className="modal-close" onClick={closeCancelModal}>&times;</button>
            </div>

            <div className="cancel-confirmation">
              <div className="cancel-icon">⚠️</div>
              <h3>Cancel this order?</h3>
              <p className="cancel-message">
                <strong>{cancelProductName}</strong> will be cancelled and refunded to your original payment method.
              </p>
              <p className="cancel-warning">This action can't be undone.</p>

              <div className="cancel-actions">
                <button className="btn btn-secondary" onClick={closeCancelModal}>
                  Keep order
                </button>
                <button className="btn btn-danger" onClick={processCancelOrder}>
                  Cancel order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>&times;</button>
            </div>

            <div className="info-card">
              <h4>Order information</h4>
              <p><strong>Order #</strong> {selectedOrder.order_number || selectedOrder.orderId || selectedOrder.id}</p>
              <p><strong>Order date:</strong> {formatDate(selectedOrder.created_at)}</p>
              <p><strong>Tracking ID:</strong> {selectedOrder.tracking_number || selectedOrder.trackingId || 'N/A'}</p>
              <p><strong>Payment method:</strong> {(selectedOrder.payment_method || selectedOrder.paymentMethod || 'N/A')?.toUpperCase()}</p>
              <p><strong>Status:</strong> <span className={`status-pill ${getStatusBadgeClass(selectedOrder.status)}`}>{selectedOrder.status?.toUpperCase() || 'PENDING'}</span></p>
            </div>

            <div className="info-card">
              <h4>Shipping address</h4>
              <p>{selectedOrder.shipping_name || selectedOrder.fullName || selectedOrder.name || 'N/A'}</p>
              <p>{selectedOrder.shipping_address || selectedOrder.address || 'N/A'}</p>
              <p>{selectedOrder.shipping_city || selectedOrder.city || ''}, {selectedOrder.shipping_state || selectedOrder.state || ''} {selectedOrder.shipping_zip || selectedOrder.zipCode || ''}</p>
              <p>Phone: {selectedOrder.shipping_phone || selectedOrder.phone || 'N/A'}</p>
              <p>Email: {selectedOrder.email || 'N/A'}</p>
            </div>

            <div className="info-card">
              <h4>Product details</h4>
              <p><strong>Product:</strong> {getProductName(selectedOrder)}</p>
              <p><strong>Size:</strong> {getProductSize(selectedOrder)}</p>
              <p><strong>Color:</strong> {getProductColor(selectedOrder)}</p>
              <p><strong>Quantity:</strong> {getProductQuantity(selectedOrder)}</p>
              <p><strong>Unit price:</strong> ${typeof getProductPrice(selectedOrder) === 'number' ? getProductPrice(selectedOrder).toFixed(2) : '0.00'}</p>
              <p><strong>Total price:</strong> ${getOrderTotal(selectedOrder).toFixed(2)}</p>
            </div>

            {selectedOrder.statusHistory && (
              <div className="info-card">
                <h4>Status history</h4>
                {selectedOrder.statusHistory.map((history, idx) => (
                  <div key={idx} className="history-row">
                    <strong>{history.status?.toUpperCase()}</strong> — {formatDate(history.date)}
                    <p className="history-note">{history.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Track Order Modal */}
      {showTrackModal && (
        <div className="modal-overlay" onClick={() => { setShowTrackModal(false); setTrackedOrder(null); setTrackingId(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Track your order</h2>
              <button className="modal-close" onClick={() => { setShowTrackModal(false); setTrackedOrder(null); setTrackingId(''); }}>&times;</button>
            </div>

            <div className="track-form">
              <input
                type="text"
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button onClick={handleTrackOrder}>Track</button>
            </div>

            {trackedOrder && (
              <div>
                <div className="info-card">
                  <h4>Order #{trackedOrder.order_number || trackedOrder.orderId || trackedOrder.id}</h4>
                  <p><strong>Date:</strong> {formatDate(trackedOrder.created_at)}</p>
                  <p><strong>Status:</strong> <span className={`status-pill ${getStatusBadgeClass(trackedOrder.status)}`}>{trackedOrder.status?.toUpperCase() || 'PENDING'}</span></p>
                </div>

                {trackedOrder.status !== 'cancelled' && (
                  <div className="order-progress">
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${(getStatusStep(trackedOrder.status) / 3) * 100}%` }} />
                    </div>
                    <div className="progress-labels">
                      <span className={getStatusStep(trackedOrder.status) >= 0 ? 'active' : ''}>Order placed</span>
                      <span className={getStatusStep(trackedOrder.status) >= 1 ? 'active' : ''}>Processing</span>
                      <span className={getStatusStep(trackedOrder.status) >= 2 ? 'active' : ''}>Shipped</span>
                      <span className={getStatusStep(trackedOrder.status) >= 3 ? 'active' : ''}>Delivered</span>
                    </div>
                  </div>
                )}

                <div className="info-card">
                  <h4>Product</h4>
                  <p><strong>{getProductName(trackedOrder)}</strong></p>
                  <p>Size: {getProductSize(trackedOrder)} | Color: {getProductColor(trackedOrder)} | Quantity: {getProductQuantity(trackedOrder)}</p>
                  <p><strong>Total: ${getOrderTotal(trackedOrder).toFixed(2)}</strong></p>
                </div>

                <div className="info-card">
                  <h4>Shipping address</h4>
                  <p>{trackedOrder.shipping_name || trackedOrder.fullName || trackedOrder.name || 'N/A'}</p>
                  <p>{trackedOrder.shipping_address || trackedOrder.address || 'N/A'}</p>
                  <p>Phone: {trackedOrder.shipping_phone || trackedOrder.phone || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;