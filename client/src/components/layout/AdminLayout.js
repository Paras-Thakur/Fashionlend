import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTags
} from 'react-icons/fa';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/admin/products', icon: FaBox, label: 'Products' },
    { path: '/admin/categories', icon: FaTags, label: 'Categories' },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' }
  ];

  const handleLogout = () => {
    logout();
  };

          if (!user || (!user.isAdmin && user.role !== 'owner')) {
          return (
            <div className="container py-5">
              <div className="alert alert-danger">
                <h4>Access Denied</h4>
                <p>You don't have permission to access the dashboard.</p>
              </div>
            </div>
          );
        }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h5 className="mb-0">{user.isAdmin ? 'Admin Panel' : 'Store Panel'}</h5>
          <button
            className="btn btn-link d-md-none"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="me-2" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <small className="text-muted">Logged in as</small>
            <div className="fw-bold">{user.firstName} {user.lastName}</div>
          </div>
          <button
            className="btn btn-outline-danger btn-sm w-100"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Navigation */}
        <nav className="admin-top-nav">
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-link d-md-none"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars />
            </button>
            <h4 className="mb-0">
              Fashion Lend {user.isAdmin ? 'Admin' : 'Store'}
            </h4>
            <div className="d-flex align-items-center">
              <span className="me-3">Welcome, {user.firstName}</span>
              <Link to="/" className="btn btn-outline-primary btn-sm">
                View Site
              </Link>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout; 