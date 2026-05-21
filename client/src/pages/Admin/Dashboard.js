import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUsers, FaBox, FaShoppingCart, FaMoneyBillWave, FaChartLine, FaPlus } from 'react-icons/fa';
import api from '../../utils/axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/orders/recent'),
        api.get('/api/admin/products/low-stock')
      ]);

      setStats({
        ...statsRes.data,
        recentOrders: ordersRes.data,
        lowStockProducts: productsRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4">
            {user.isAdmin ? 'Admin Dashboard' : 'Store Dashboard'}
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalUsers}
                  </div>
                </div>
                <div className="col-auto">
                  <FaUsers className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Products
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalProducts}
                  </div>
                </div>
                <div className="col-auto">
                  <FaBox className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Total Orders
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalOrders}
                  </div>
                </div>
                <div className="col-auto">
                  <FaShoppingCart className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Total Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="col-auto">
                  <FaMoneyBillWave className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <Link to="/admin/products/add" className="btn btn-primary btn-block">
                    <FaPlus className="me-2" />
                    Add Product
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/products" className="btn btn-info btn-block">
                    <FaBox className="me-2" />
                    Manage Products
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/orders" className="btn btn-success btn-block">
                    <FaShoppingCart className="me-2" />
                    View Orders
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link to="/admin/users" className="btn btn-warning btn-block">
                    <FaUsers className="me-2" />
                    Manage Users
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Orders */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="m-0 font-weight-bold text-primary">Recent Orders</h6>
            </div>
            <div className="card-body">
              {stats.recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <Link to={`/admin/orders/${order._id}`}>
                              #{order._id.slice(-6)}
                            </Link>
                          </td>
                          <td>{order.user?.firstName} {order.user?.lastName}</td>
                          <td>₹{order.totalAmount}</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No recent orders</p>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="m-0 font-weight-bold text-primary">Low Stock Products</h6>
            </div>
            <div className="card-body">
              {stats.lowStockProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lowStockProducts.map((product) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>
                            <span className={`badge bg-${product.stock <= 0 ? 'danger' : 'warning'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td>
                            <Link to={`/admin/products/${product._id}/edit`} className="btn btn-sm btn-primary">
                              Update Stock
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">All products have sufficient stock</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

export default AdminDashboard; 