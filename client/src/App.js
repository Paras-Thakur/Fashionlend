import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import TrackOrder from './pages/TrackOrder';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import ImageTest from './pages/ImageTest';
import Wishlist from './pages/Wishlist';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AddProduct from './pages/Admin/AddProduct';
import Categories from './pages/Admin/Categories';

// Owner Pages
import OwnerDashboard from './pages/OwnerDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Customer Route Component - Only for regular users, not owners
const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is owner (not admin)
  const isOwner = user && user.role === 'owner' && !user.isAdmin;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (isOwner) {
    return <Navigate to="/owner-dashboard" />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user && (user.isAdmin || user.role === 'owner') ? children : <Navigate to="/login" />;
};

// Auth Route Component - Redirect authenticated users to home
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to home page
  if (user) {
    // Check if user is admin/owner and redirect accordingly
    if (user.isAdmin) {
      return <Navigate to="/admin" />;
    } else if (user.role === 'owner') {
      return <Navigate to="/owner-dashboard" />;
    } else {
      return <Navigate to="/home" />;
    }
  }
  
  return children;
};

// Landing Route Component - Show login for unauthenticated users, redirect authenticated users
const LandingRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    if (user.isAdmin) {
      return <Navigate to="/admin" />;
    } else if (user.role === 'owner') {
      return <Navigate to="/owner-dashboard" />;
    } else {
      return <Navigate to="/home" />;
    }
  }
  
  // If not authenticated, show login page
  return <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Landing Route - Redirects to login or appropriate dashboard */}
        <Route path="/" element={<LandingRoute />} />
        
        {/* Auth Routes - Login and Register */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<div className="container py-5"><h2>Orders Management (Coming Soon)</h2></div>} />
          <Route path="users" element={<div className="container py-5"><h2>Users Management (Coming Soon)</h2></div>} />
          <Route path="analytics" element={<div className="container py-5"><h2>Analytics (Coming Soon)</h2></div>} />
          <Route path="settings" element={<div className="container py-5"><h2>Settings (Coming Soon)</h2></div>} />
        </Route>

        {/* Protected Routes - Require authentication */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/products/category/:category" element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/products/state/:state" element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/products/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProductDetail />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/cart" element={
          <ProtectedRoute>
            <Layout>
              <CustomerRoute>
                <Cart />
              </CustomerRoute>
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Layout>
              <CustomerRoute>
                <Checkout />
              </CustomerRoute>
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <Layout>
              <CustomerRoute>
                <Orders />
              </CustomerRoute>
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/owner-dashboard" element={
          <ProtectedRoute>
            <Layout>
              <OwnerDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <Layout>
              <CustomerRoute>
                <OrderDetail />
              </CustomerRoute>
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/track-order" element={
          <ProtectedRoute>
            <Layout>
              <TrackOrder />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/support" element={
          <ProtectedRoute>
            <Layout>
              <Support />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Layout>
              <CustomerRoute>
                <Wishlist />
              </CustomerRoute>
            </Layout>
          </ProtectedRoute>
        } />
        

        
        <Route path="/image-test" element={
          <ProtectedRoute>
            <Layout>
              <ImageTest />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={
          <ProtectedRoute>
            <Layout>
              <NotFound />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App; 