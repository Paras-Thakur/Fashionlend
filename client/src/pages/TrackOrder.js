import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const TrackOrder = () => {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchForm, setSearchForm] = useState({
    orderId: '',
    phoneNumber: ''
  });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    orderStatus: '',
    trackingNumber: '',
    notes: ''
  });

  // Check if user is owner
  const isOwner = user && (user.role === 'owner' || user.isAdmin);

  const handleSearchChange = (e) => {
    setSearchForm({
      ...searchForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateChange = (e) => {
    setUpdateForm({
      ...updateForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.orderId.trim() || !searchForm.phoneNumber.trim()) {
      toast.error('Please enter both Order ID and Phone Number');
      return;
    }

    setLoading(true);
    try {
      // Remove # symbol if present and trim whitespace
      const cleanOrderId = searchForm.orderId.trim().replace('#', '');
      
      const response = await api.get(`/api/orders/track`, {
        params: {
          orderId: cleanOrderId,
          phoneNumber: searchForm.phoneNumber.trim()
        }
      });
      setOrder(response.data);
      toast.success('Order found!');
    } catch (error) {
      console.error('Error tracking order:', error);
      const message = error.response?.data?.message || 'Order not found. Please check your details.';
      toast.error(message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!updateForm.orderStatus) {
      toast.error('Please select an order status');
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/api/orders/${order._id}/owner-update`, updateForm);
      toast.success('Order status updated successfully!');
      
      // Refresh order data
      const response = await api.get(`/api/orders/track`, {
        params: {
          orderId: searchForm.orderId.trim(),
          phoneNumber: searchForm.phoneNumber.trim()
        }
      });
      setOrder(response.data);
      setShowUpdateForm(false);
      setUpdateForm({ orderStatus: '', trackingNumber: '', notes: '' });
    } catch (error) {
      console.error('Error updating order:', error);
      const message = error.response?.data?.message || 'Failed to update order status';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      failed: 'danger',
      refunded: 'info'
    };
    return colors[status] || 'secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canUpdateOrder = () => {
    if (!isOwner || !order) return false;
    
    // Check if this order contains products owned by the current user
    return order.ownerNotifications?.some(
      notification => notification.owner.toString() === user._id.toString()
    );
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 text-center mb-3">
            <FaTruck className="me-3" />
            Track Your Order
          </h1>
          <p className="text-muted text-center">
            Enter your Order ID (shortened or full) and Phone Number to track your order status
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="mb-3">
                  <label htmlFor="orderId" className="form-label">
                    Order ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="orderId"
                    name="orderId"
                    value={searchForm.orderId}
                    onChange={handleSearchChange}
                    placeholder="Enter your Order ID (e.g., 15603c or full 24-character ID)"
                    required
                  />
                  <small className="text-muted">
                    You can find this in your order confirmation email or in your orders page. You can use either the shortened Order ID (like 15603c) or the full 24-character Order ID. The # symbol is optional.
                  </small>
                </div>
                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={searchForm.phoneNumber}
                    onChange={handleSearchChange}
                    placeholder="Enter the phone number used for the order"
                    required
                  />
                </div>
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="fa-spin me-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <FaSearch className="me-2" />
                        Track Order
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      {order && (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Order #{order._id.toString().slice(-6)}
                  </h5>
                  {canUpdateOrder() && (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowUpdateForm(!showUpdateForm)}
                    >
                      {showUpdateForm ? 'Cancel Update' : 'Update Status'}
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                {/* Order Status */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Order Status</h6>
                    <div className="d-flex flex-column mb-2">
                      <span className={`badge bg-${getStatusColor(order.orderStatus)} mb-1`}>
                        {getStatusIcon(order.orderStatus)} Order: {order.orderStatus.toUpperCase()}
                      </span>
                      <span className={`badge bg-${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    <small className="text-muted">
                      Last updated: {formatDateTime(order.updatedAt)}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Date</h6>
                    <p className="mb-0">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6><FaUser className="me-2" />Customer Information</h6>
                    <p className="mb-1">
                      <strong>Name:</strong> {order.user?.firstName} {order.user?.lastName}
                    </p>
                    <p className="mb-1">
                      <FaPhone className="me-2" />
                      {order.shippingAddress.phone}
                    </p>
                    <p className="mb-0">
                      <FaEnvelope className="me-2" />
                      {order.user?.email}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6><FaMapMarkerAlt className="me-2" />Delivery Address</h6>
                    <p className="mb-1">{order.shippingAddress.street}</p>
                    <p className="mb-1">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="mb-0">{order.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Rental Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6><FaCalendarAlt className="me-2" />Rental Period</h6>
                    <p className="mb-1">
                      <strong>Start Date:</strong> {formatDate(order.rentalDates.startDate)}
                    </p>
                    <p className="mb-1">
                      <strong>End Date:</strong> {formatDate(order.rentalDates.endDate)}
                    </p>
                    <p className="mb-0">
                      <strong>Duration:</strong> {Math.ceil((new Date(order.rentalDates.endDate) - new Date(order.rentalDates.startDate)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6><FaCreditCard className="me-2" />Payment Details</h6>
                    <p className="mb-1">
                      <strong>Method:</strong> {order.paymentMethod.toUpperCase()}
                    </p>
                    <p className="mb-1">
                      <strong>Advance:</strong> ₹{order.advancePayment}
                    </p>
                    <p className="mb-1">
                      <strong>Remaining:</strong> ₹{order.remainingPayment}
                    </p>
                    <p className="mb-0">
                      <strong>Total:</strong> ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6><FaTruck className="me-2" />Tracking Information</h6>
                      <p className="mb-0">
                        <strong>Tracking Number:</strong> {order.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Status Summary */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6>Current Status</h6>
                    <div className="alert alert-info">
                      <div className="d-flex align-items-center">
                        <div className={`badge bg-${getStatusColor(order.orderStatus)} me-3`} style={{ fontSize: '1rem' }}>
                          {getStatusIcon(order.orderStatus)} {order.orderStatus.toUpperCase()}
                        </div>
                        <div>
                          <strong>Last Updated:</strong> {formatDateTime(order.updatedAt)}
                          {order.trackingHistory && order.trackingHistory.length > 1 && (
                            <div className="text-muted small">
                              Status changed {order.trackingHistory.length - 1} time(s)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking History */}
                {order.trackingHistory && order.trackingHistory.length > 1 && (
                  <div className="mb-4">
                    <h6>Status History</h6>
                    <div className="timeline" style={{ position: 'relative', paddingLeft: '20px' }}>
                      {order.trackingHistory
                        .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
                        .map((entry, index) => (
                        <div key={index} className="timeline-item" style={{ position: 'relative', marginBottom: '20px' }}>
                          <div className="timeline-marker" style={{ position: 'absolute', left: '-30px', top: '5px' }}>
                            <div 
                              className={`timeline-dot bg-${getStatusColor(entry.status)}`}
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                boxShadow: '0 0 0 2px #dee2e6'
                              }}
                            ></div>
                          </div>
                          <div className="timeline-content" style={{ 
                            borderLeft: '2px solid #dee2e6',
                            paddingLeft: '20px',
                            position: 'relative'
                          }}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1 text-capitalize">
                                  {entry.status}
                                  {index === order.trackingHistory.length - 1 && (
                                    <span className="badge bg-success ms-2">Current</span>
                                  )}
                                </h6>
                                <p className="mb-1 text-muted">{entry.description}</p>
                              </div>
                              <small className="text-muted">
                                {formatDateTime(entry.updatedAt)}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-4">
                  <h6>Order Items</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Size</th>
                          <th>Color</th>
                          <th>Duration</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={item.product?.images?.[0] || 'https://via.placeholder.com/50x50?text=Product'}
                                  alt={item.product?.name}
                                  className="me-2"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <span>{item.product?.name || 'Product'}</span>
                              </div>
                            </td>
                            <td>{item.size}</td>
                            <td>{item.color || 'N/A'}</td>
                            <td>{item.rentalDuration} days</td>
                            <td>₹{item.totalPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mb-4">
                    <h6>Notes</h6>
                    <p className="mb-0 text-muted">{order.notes}</p>
                  </div>
                )}

                {/* Owner Update Form */}
                {showUpdateForm && canUpdateOrder() && (
                  <div className="border-top pt-4">
                    <h6>Update Order Status</h6>
                    <form onSubmit={handleUpdateOrder}>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="orderStatus" className="form-label">
                            Order Status <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            id="orderStatus"
                            name="orderStatus"
                            value={updateForm.orderStatus}
                            onChange={handleUpdateChange}
                            required
                          >
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="returned">Returned</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="trackingNumber" className="form-label">
                            Tracking Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="trackingNumber"
                            name="trackingNumber"
                            value={updateForm.trackingNumber}
                            onChange={handleUpdateChange}
                            placeholder="Enter tracking number"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="notes" className="form-label">
                            Notes
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="notes"
                            name="notes"
                            value={updateForm.notes}
                            onChange={handleUpdateChange}
                            placeholder="Add any notes"
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={updating}
                        >
                          {updating ? (
                            <>
                              <FaSpinner className="fa-spin me-2" />
                              Updating...
                            </>
                          ) : (
                            'Update Order'
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowUpdateForm(false);
                            setUpdateForm({ orderStatus: '', trackingNumber: '', notes: '' });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder; 