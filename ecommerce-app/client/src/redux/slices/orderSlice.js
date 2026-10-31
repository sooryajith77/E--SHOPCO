import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).token : null;
};

// Async thunks for orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      return data.orders || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderByTrackingId = createAsyncThunk(
  'orders/fetchOrderByTrackingId',
  async (trackingId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/orders/track/${trackingId}`);
      if (!response.ok) throw new Error('Order not found');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update order status');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  orders: JSON.parse(localStorage.getItem('orders')) || [],
  currentOrder: null,
  loading: false,
  error: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    localCreateOrder: (state, action) => {
      const newOrder = {
        ...action.payload,
        id: Date.now(),
        orderId: 'ORD' + Math.floor(Math.random() * 1000000)
      };
      state.orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(state.orders));
    },
    localUpdateStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        localStorage.setItem('orders', JSON.stringify(state.orders));
      }
    },
    localDeleteOrder: (state, action) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
      localStorage.setItem('orders', JSON.stringify(state.orders));
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
        localStorage.setItem('orders', JSON.stringify(state.orders));
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
          localStorage.setItem('orders', JSON.stringify(state.orders));
        }
      })
      
      // Track order
      .addCase(fetchOrderByTrackingId.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      });
  }
});

export const { 
  clearOrderError, 
  clearCurrentOrder, 
  localCreateOrder, 
  localUpdateStatus, 
  localDeleteOrder 
} = orderSlice.actions;

export default orderSlice.reducer;