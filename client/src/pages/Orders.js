import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FaEye, FaSearch, FaFilter, FaCalendarAlt, FaCreditCard, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const Orders = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
    fetchStats();
  }, [user, currentPage, filters]);

  // Listen for real-time order status updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdate = (data) => {
      const { orderId, order, status, message } = data;
      
      // Update the orders list
      setOrders(prevOrders => {
        const orderExists = prevOrders.some(o => o._id === orderId);
        
        if (orderExists) {
          // Update existing order
          return prevOrders.map(o => 
            o._id === orderId ? { 
              ...o, 
              ...order, 
              orderStatus: status || order.orderStatus || o.orderStatus 
            } : o
          );
        } else {
          // If order is not in the current list and matches filters, add it
          if (!filters.status || filters.status === (status || order.orderStatus)) {
            return [order, ...prevOrders];
          }
          return prevOrders;
        }
      });

      // Show toast notification
      toast.info(message || 'Order status updated', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Refresh stats if needed
      fetchStats();
    };

    socket.on('order-status-updated', handleOrderStatusUpdate);

    return () => {
      socket.off('order-status-updated', handleOrderStatusUpdate);
    };
  }, [socket, filters.status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters
      });

      const response = await api.get(`/api/orders?${params}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/orders/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateRange: ''
    });
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success',
      returned: 'secondary',
      cancelled: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock />,
      confirmed: <FaCheckCircle />,
      shipped: <FaTruck />,
      delivered: <FaCheckCircle />,
      returned: <FaTimesCircle />,
      cancelled: <FaTimesCircle />
    };
    return icons[status] || <FaClock />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      failed: 'danger',
      refunded: 'info'
    };
    return colors[status] || 'secondary';
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });

      // Check if the response is actually a PDF
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // This is an error response, not a PDF
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            console.error('Server error:', errorData);
            toast.error(errorData.message || 'Failed to generate invoice');
          } catch (e) {
            toast.error('Failed to download invoice. Please try again.');
          }
        };
        reader.readAsText(response.data);
        return;
      }

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId.toString().slice(-6)}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Download invoice error:', error);
      toast.error('Failed to download invoice. Please try again.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h2">My Orders</h1>
          <p className="text-muted">Track and manage your rental orders</p>
        </div>
        <div className="col-md-6 text-md-end">
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.totalOrders || 0}</h4>
                  <small>Total Orders</small>
                </div>
                <div className="align-self-center">
                  <FaCalendarAlt size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.pendingOrders || 0}</h4>
                  <small>Pending Orders</small>
                </div>
                <div className="align-self-center">
                  <FaClock size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.activeOrders || 0}</h4>
                  <small>Active Orders</small>
                </div>
                <div className="align-self-center">
                  <FaTruck size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">₹{(stats.totalSpent || 0).toLocaleString()}</h4>
                  <small>Total Spent</small>
                </div>
                <div className="align-self-center">
                  <FaCreditCard size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search orders by ID, product name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-3">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter className="me-1" />
                  Filters
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          {showFilters && (
            <div className="row mt-3">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="">All Time</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-5">
          <FaSpinner className="fa-spin" size={48} />
          <p className="mt-3">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5">
          <FaCalendarAlt size={64} className="text-muted mb-3" />
          <h3>No Orders Found</h3>
          <p className="text-muted mb-4">
            {filters.status || filters.search ? 'No orders match your filters.' : 'You haven\'t placed any orders yet.'}
          </p>
          {filters.status || filters.search ? (
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          ) : (
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="row">
            {orders.map((order) => (
              <div key={order._id} className="col-12 mb-4">
                <div className="card">
                  <div className="card-header">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <h6 className="mb-0">
                          Order #{order._id.toString().slice(-6)}
                          <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={() => {
                              navigator.clipboard.writeText(order._id);
                              toast.success('Full Order ID copied to clipboard!');
                            }}
                            title="Copy full Order ID"
                          >
                            Copy Full ID
                          </button>
                        </h6>
                        <small className="text-muted">
                          Placed on {formatDateTime(order.createdAt)}
                        </small>
                      </div>
                      <div className="col-md-6 text-md-end">
                        <div className="d-flex flex-column align-items-end">
                          <span className={`badge bg-${getStatusColor(order.orderStatus)} mb-1`}>
                            {getStatusIcon(order.orderStatus)} Order: {order.orderStatus.toUpperCase()}
                          </span>
                          <span className={`badge bg-${getPaymentStatusColor(order.paymentStatus)}`}>
                            Payment: {order.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    {/* Order Summary */}
                    <div className="row mb-3">
                      <div className="col-md-8">
                        <h6>Items ({order.items.length})</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="d-flex align-items-center p-2 border rounded">
                              <img
                                src={item.product?.images?.[0] || 'https://via.placeholder.com/40x40?text=Product'}
                                alt={item.product?.name}
                                className="rounded me-2"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                              <div>
                                <small className="fw-bold">{item.product?.name}</small>
                                <br />
                                <small className="text-muted">Qty: {item.quantity}</small>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="d-flex align-items-center p-2 border rounded">
                              <small className="text-muted">+{order.items.length - 3} more items</small>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4 text-md-end">
                        <div className="mb-2">
                          <strong>Total Amount:</strong>
                          <br />
                          <span className="h5 text-primary">₹{order.totalAmount}</span>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">
                            Rental: {formatDate(order.rentalDates.startDate)} - {formatDate(order.rentalDates.endDate)}
                          </small>
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <small className="text-muted">
                              Tracking: {order.trackingNumber}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="row mt-3">
                      <div className="col-12 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            onClick={() => downloadInvoice(order._id)}
                            className="btn btn-outline-secondary btn-sm"
                          >
                            <FaDownload className="me-1" />
                            Download Invoice
                          </button>
                          <Link
                            to={`/orders/${order._id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            <FaEye className="me-1" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Orders pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default Orders; 