

// API service for making HTTP requests to PostgreSQL backend
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";
// Helper function for handling responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get token from localStorage
// Change this:


// To this:
const getToken = () => {
  return localStorage.getItem('token'); // Much simpler and safer!
};

// Product APIs
export const productAPI = {
  // Public routes (no authentication needed)
  getAllProducts: async () => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
  },
  
  getProductById: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  },
  
  getProductsByCategory: async (category) => {
    const response = await fetch(`${API_URL}/products/category/${category}`);
    return handleResponse(response);
  },
  
  getAllCategories: async () => {
    const response = await fetch(`${API_URL}/products/categories`);
    return handleResponse(response);
  },
  
  // Admin routes (require authentication)
  createProduct: async (productData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },
  
  updateProduct: async (id, productData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },
  
  deleteProduct: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  }
};

// Auth APIs
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },
  
  register: async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(response);
  },
  
  getCurrentUser: async () => {
    const token = getToken();
    if (!token) return null;
    
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  getAllUsers: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  getUserById: async (userId) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  updateUser: async (userId, userData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },
  
  deleteUser: async (userId) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  getAllOrders: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  updateOrderStatus: async (orderId, status) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  }
};

// Cart APIs
export const cartAPI = {
  getCart: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  addToCart: async (productId, quantity) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });
    return handleResponse(response);
  },
  
  updateCartItem: async (itemId, quantity) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
    return handleResponse(response);
  },
  
  removeFromCart: async (itemId) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },
  
  clearCart: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  }
};

// Default export for convenience
const api = {
  productAPI,
  authAPI,
  adminAPI,
  cartAPI
};

export default api;