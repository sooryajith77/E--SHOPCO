import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
} = authSlice.actions;

export default authSlice.reducer;



// import { createSlice } from '@reduxjs/toolkit';

// const loadUserFromStorage = () => {
//   const user = localStorage.getItem('user');
//   if (user) {
//     try {
//       const parsed = JSON.parse(user);
//       return {
//         user: parsed,
//         isAuthenticated: true,
//         loading: false,
//         error: null
//       };
//     } catch (e) {
//       return {
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: null
//       };
//     }
//   }
//   return {
//     user: null,
//     isAuthenticated: false,
//     loading: false,
//     error: null
//   };
// };

// const initialState = loadUserFromStorage();

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     loginStart: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     loginSuccess: (state, action) => {
//       state.loading = false;
//       state.isAuthenticated = true;
//       state.user = action.payload;
//       state.error = null;
//       // Store in localStorage
//       localStorage.setItem('user', JSON.stringify(action.payload));
//     },
//     loginFailure: (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem('user');
//     }
//   }
// });

// export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
// export default authSlice.reducer;