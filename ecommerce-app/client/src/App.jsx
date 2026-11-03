


import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Wishlist from './pages/Wishlist.jsx';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Brands from './pages/Brands';
import BrandProducts from './pages/BrandProducts';
import ProtectedRoute from './routes/ProtectedRoute';
import './index.css';

function AppContent() {
  const location = useLocation();

  const hideFooterOnPages = ['/login', '/register', '/admin'];
  const shouldHideFooter = hideFooterOnPages.includes(location.pathname);

   const hideNavbarOnPages = ['/admin','/login','/register'];
  const shouldHideNavbar = hideNavbarOnPages.includes(location.pathname);

  return (
    <div className="app">
     { !shouldHideNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/brands/:id" element={<BrandProducts />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      {/* ✅ Add future flags to remove warnings */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;