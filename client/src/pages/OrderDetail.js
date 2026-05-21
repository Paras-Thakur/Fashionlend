import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaPrint, FaDownload, FaPhone, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id, user]);

  // Listen for real-time order status updates
  useEffect(() => {
    if (!socket || !id) return;

    const handleOrderStatusUpdate = (data) => {
      const { orderId, order: updatedOrder, status, paymentStatus, trackingNumber, message } = data;
      
      // Only update if this is the current order
      if (orderId === id) {
        setOrder(prevOrder => {
          if (!prevOrder) return updatedOrder;
          
          return {
            ...prevOrder,
            orderStatus: status || prevOrder.orderStatus,
            paymentStatus: paymentStatus || prevOrder.paymentStatus,
            trackingNumber: trackingNumber || prevOrder.trackingNumber,
            ...updatedOrder
          };
        });

        // Show toast notification
        toast.info(message || 'Order status updated', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };

    socket.on('order-status-updated', handleOrderStatusUpdate);

    return () => {
      socket.off('order-status-updated', handleOrderStatusUpdate);
    };
  }, [socket, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/api/orders/${id}/status`, { orderStatus: newStatus });
      toast.success('Order status updated successfully');
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
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

  const printOrder = () => {
    window.print();
  };

  const downloadInvoice = async () => {
    try {
      const response = await api.get(`/api/orders/${order._id}/invoice`, {
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
      link.download = `invoice-${order._id.toString().slice(-6)}.pdf`;
      
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

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <FaSpinner className="fa-spin" size={48} />
          <p className="mt-3">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h3>Order Not Found</h3>
          <p className="text-muted">The order you're looking for doesn't exist.</p>
          <Link to="/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <button 
            onClick={() => navigate('/orders')} 
            className="btn btn-outline-secondary mb-3"
          >
            <FaArrowLeft className="me-2" />
            Back to Orders
          </button>
          <h1 className="h2">Order #{order._id.toString().slice(-6)}</h1>
          <p className="text-muted">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="col-md-6 text-md-end">
          <div className="d-flex gap-2 justify-content-md-end">
            <button className="btn btn-outline-secondary" onClick={printOrder}>
              <FaPrint className="me-2" />
              Print
            </button>
            <button className="btn btn-outline-secondary" onClick={downloadInvoice}>
              <FaDownload className="me-2" />
              Download Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Order Details */}
        <div className="col-lg-8">
          {/* Order Status */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Status</h5>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="d-flex gap-2 mb-2">
                    <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
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
                <div className="col-md-6 text-md-end">
                  {user.role === 'owner' && (
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => updateOrderStatus('confirmed')}
                        disabled={updating || order.orderStatus === 'confirmed'}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => updateOrderStatus('shipped')}
                        disabled={updating || order.orderStatus === 'shipped'}
                      >
                        Ship
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => updateOrderStatus('delivered')}
                        disabled={updating || order.orderStatus === 'delivered'}
                      >
                        Deliver
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Items</h5>
            </div>
            <div className="card-body">
              {order.items.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-3 p-3 border rounded">
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/80x80?text=Product'}
                    alt={item.product?.name}
                    className="rounded me-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.product?.name}</h6>
                    <p className="text-muted mb-1">
                      Size: {item.size} | Quantity: {item.quantity} | Duration: {item.rentalDuration} days
                    </p>
                    <p className="text-muted mb-1">
                      Rental Price: ₹{item.rentalPrice}/day
                    </p>
                    <p className="mb-0 fw-bold">Total: ₹{item.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <FaMapMarkerAlt className="me-2" />
                Shipping Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Delivery Address</h6>
                  <p className="mb-1">{order.shippingAddress.street}</p>
                  <p className="mb-1">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p className="mb-1">{order.shippingAddress.country}</p>
                  <p className="mb-0">
                    <FaPhone className="me-2" />
                    {order.shippingAddress.phone}
                  </p>
                </div>
                <div className="col-md-6">
                  <h6>Rental Period</h6>
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
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaTruck className="me-2" />
                  Tracking Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Tracking Number</h6>
                    <p className="mb-0">
                      <strong>{order.trackingNumber}</strong>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Carrier</h6>
                    <p className="mb-0">Standard Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Owner Notifications */}
          {order.ownerNotifications && order.ownerNotifications.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Owner Notifications</h5>
              </div>
              <div className="card-body">
                {order.ownerNotifications.map((notification, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <div>
                      <strong>{notification.owner?.firstName} {notification.owner?.lastName}</strong>
                      <br />
                      <small className="text-muted">
                        {notification.products.map(p => `${p.productName} (Qty: ${p.quantity})`).join(', ')}
                      </small>
                    </div>
                    <div className="text-end">
                      <span className={`badge bg-${notification.notified ? 'success' : 'warning'}`}>
                        {notification.notified ? 'Notified' : 'Pending'}
                      </span>
                      {notification.notifiedAt && (
                        <>
                          <br />
                          <small className="text-muted">
                            {formatDateTime(notification.notifiedAt)}
                          </small>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Payment Summary */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <FaCreditCard className="me-2" />
                Payment Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span className="text-success">Free</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (18% GST):</span>
                <span>₹{order.tax}</span>
              </div>
              {order.advancePayment > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Advance Payment:</span>
                  <span className="text-success">-₹{order.advancePayment}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <strong>Total Amount:</strong>
                <strong>₹{order.totalAmount}</strong>
              </div>
              {order.advancePayment > 0 && (
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Remaining Payment:</span>
                  <span className="text-muted">₹{order.remainingPayment}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Payment Method</h5>
            </div>
            <div className="card-body">
              <p className="mb-1">
                <strong>{order.paymentMethod.toUpperCase()}</strong>
              </p>
              <p className="mb-0 text-muted">
                {order.paymentMethod === 'cod' && 'Cash on Delivery'}
                {order.paymentMethod === 'online' && 'Online Payment'}
                {order.paymentMethod === 'card' && 'Credit/Debit Card'}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Customer Information</h5>
            </div>
            <div className="card-body">
              <p className="mb-1">
                <strong>{user.firstName} {user.lastName}</strong>
              </p>
              <p className="mb-1">
                <FaEnvelope className="me-2" />
                {user.email}
              </p>
              <p className="mb-0">
                <FaPhone className="me-2" />
                {user.phoneNumber}
              </p>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Order Notes</h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="card">
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/orders" className="btn btn-outline-secondary">
                  <FaArrowLeft className="me-2" />
                  Back to Orders
                </Link>
                <Link to="/products" className="btn btn-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 