


import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { authAPI } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Show loading toast
    const toastId = toast.loading('Logging in...');
    
    try {
      dispatch(loginStart());
      const response = await authAPI.login(email, password);
      
      // Update loading toast to success
      toast.update(toastId, {
        render: ' Login successful! Welcome back.',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      
      // The response should contain user data with token
      dispatch(loginSuccess(response));
      
      // Redirect based on role
      setTimeout(() => {
        if (response.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 500);
      
    } catch (error) {
      // ✅ CORRECTED: Use toast.error() with proper syntax
      toast.update(toastId, {
        render: ` Login failed: ${error.message || 'Please check your credentials.'}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
      
      // Or simply use:
      // toast.error('Login failed. Please check your credentials.');
      
      dispatch(loginFailure(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ✅ Add ToastContainer */}
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
      
      <div className="auth-container">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="demo-credentials">
          <p>Demo Credentials:</p>
          <p><strong>Admin:</strong> admin@shop.co / admin123</p>
          <p><strong>User:</strong> user@example.com / user123</p>
        </div>
        
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;