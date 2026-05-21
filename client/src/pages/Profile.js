import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaShoppingBag, FaCog, FaSync, FaExternalLinkAlt, FaTrash } from 'react-icons/fa';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { socket } = useSocket();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteAccountData, setDeleteAccountData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  // Check if user is owner (not admin)
  const isOwner = user && user.role === 'owner' && !user.isAdmin;

  useEffect(() => {
    if (user && !isOwner) {
      fetchOrders();
    }
  }, [user, isOwner]);

  // Listen for real-time order status updates
  useEffect(() => {
    if (!socket || isOwner) return;

    const handleOrderStatusUpdate = (data) => {
      const { orderId, order, status, message } = data;
      
      // Update the orders list
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(o => 
          o._id === orderId ? { ...order, orderStatus: status } : o
        );
        
        // If order is not in the current list, add it
        const orderExists = prevOrders.some(o => o._id === orderId);
        if (!orderExists) {
          return [order, ...updatedOrders];
        }
        
        return updatedOrders;
      });

      // Show toast notification
      toast.info(message || 'Order status updated', {
        position: 'top-right',
        autoClose: 3000,
      });
    };

    socket.on('order-status-updated', handleOrderStatusUpdate);

    return () => {
      socket.off('order-status-updated', handleOrderStatusUpdate);
    };
  }, [socket, isOwner]);

  // Set active tab based on URL hash or query parameter
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    // For owners, only allow profile and settings tabs
    if (isOwner) {
      if (hash === 'settings' || tabParam === 'settings') {
        setActiveTab('settings');
      } else {
        setActiveTab('profile');
      }
      return;
    }
    
    // For regular users, allow all tabs
    if (hash === 'orders' || tabParam === 'orders') {
      setActiveTab('orders');
    } else if (hash === 'settings' || tabParam === 'settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('profile');
    }
  }, [location.hash, location.search, isOwner]);

  const handleTabChange = (tab) => {
    // For owners, only allow profile and settings tabs
    if (isOwner && tab === 'orders') {
      return;
    }
    
    setActiveTab(tab);
    // Update URL without causing a page reload
    const newUrl = tab === 'profile' ? '/profile' : `/profile#${tab}`;
    window.history.replaceState(null, '', newUrl);
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await api.get('/api/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password updated successfully!');
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccountChange = (e) => {
    const { name, value } = e.target;
    setDeleteAccountData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!deleteAccountData.password || !deleteAccountData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (deleteAccountData.password !== deleteAccountData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Final confirmation with different messages for owners vs regular users
    const confirmMessage = isOwner 
      ? 'Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete:\n\n• All your products and inventory\n• All orders associated with your products\n• Your store data and settings\n• All your personal data (orders, wishlist, cart)\n\nThis will affect customers who have ordered your products.'
      : 'Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data including orders, wishlist, and cart items.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteAccountLoading(true);

    try {
      const response = await api.delete('/api/auth/delete-account', {
        data: {
          password: deleteAccountData.password
        }
      });

      toast.success('Account deleted successfully!');
      
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      const message = error.response?.data?.message || 'Failed to delete account';
      toast.error(message);
    } finally {
      setDeleteAccountLoading(false);
    }
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'failed': return 'danger';
      case 'refunded': return 'info';
      default: return 'secondary';
    }
  };

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <h4>Please Login</h4>
          <p>You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="profile-avatar">
                  <FaUser size={50} />
                </div>
              </div>
              <h5 className="card-title">{user.firstName} {user.lastName}</h5>
              <p className="text-muted">{user.email}</p>
              
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => handleTabChange('profile')}
                >
                  <FaUser className="me-2" />
                  Profile Information
                </button>
                {/* Hide My Orders tab for owners */}
                {!isOwner && (
                  <button
                    className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => handleTabChange('orders')}
                  >
                    <FaShoppingBag className="me-2" />
                    My Orders
                  </button>
                )}

                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => handleTabChange('settings')}
                >
                  <FaCog className="me-2" />
                  Account Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Profile Information</h5>
                {!isEditing ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      <FaSave className="me-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                          phoneNumber: user.phoneNumber,
                          address: user.address || {
                            street: '',
                            city: '',
                            state: '',
                            zipCode: '',
                            country: 'India'
                          }
                        });
                      }}
                    >
                      <FaTimes className="me-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <h6 className="mt-4 mb-3">Address Information</h6>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Orders Tab - Only show for non-owners */}
          {activeTab === 'orders' && !isOwner && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">My Orders</h5>
                <div>
                  <Link to="/orders" className="btn btn-primary btn-sm me-2">
                    <FaExternalLinkAlt className="me-1" />
                    View All Orders
                  </Link>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={fetchOrders}
                    disabled={ordersLoading}
                  >
                    <FaSync className={`me-1 ${ordersLoading ? 'fa-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
              <div className="card-body">
                {ordersLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading orders...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>#{order._id.slice(-6)}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>{order.items.length} items</td>
                            <td>₹{order.totalAmount}</td>
                            <td>
                              <div className="d-flex flex-column">
                                <span className={`badge bg-${getStatusColor(order.orderStatus)} mb-1`}>
                                  Order: {order.orderStatus}
                                </span>
                                <span className={`badge bg-${getPaymentStatusColor(order.paymentStatus)}`}>
                                  Payment: {order.paymentStatus}
                                </span>
                              </div>
                            </td>
                            <td>
                              <Link 
                                to={`/orders/${order._id}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaShoppingBag size={50} className="text-muted mb-3" />
                    <h5>No Orders Yet</h5>
                    <p className="text-muted">You haven't placed any orders yet.</p>
                    <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                  </div>
                )}
              </div>
            </div>
          )}



          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Account Settings</h5>
              </div>
                             <div className="card-body">
                 <div className="row">
                   {/* Change Password - Left Side */}
                   <div className="col-md-6 mb-4">
                     <div className="card h-100">
                       <div className="card-body">
                         <h6 className="card-title">Change Password</h6>
                         <form onSubmit={handlePasswordSubmit}>
                           <div className="mb-3">
                             <label className="form-label">Current Password</label>
                             <input 
                               type="password" 
                               className="form-control"
                               name="currentPassword"
                               value={passwordData.currentPassword}
                               onChange={handlePasswordChange}
                               required
                             />
                           </div>
                           <div className="mb-3">
                             <label className="form-label">New Password</label>
                             <input 
                               type="password" 
                               className="form-control"
                               name="newPassword"
                               value={passwordData.newPassword}
                               onChange={handlePasswordChange}
                               minLength="6"
                               required
                             />
                             <div className="form-text">Password must be at least 6 characters long</div>
                           </div>
                           <div className="mb-3">
                             <label className="form-label">Confirm New Password</label>
                             <input 
                               type="password" 
                               className="form-control"
                               name="confirmPassword"
                               value={passwordData.confirmPassword}
                               onChange={handlePasswordChange}
                               required
                             />
                           </div>
                           <button 
                             type="submit" 
                             className="btn btn-primary"
                             disabled={passwordLoading}
                           >
                             {passwordLoading ? 'Updating...' : 'Update Password'}
                           </button>
                         </form>
                       </div>
                     </div>
                   </div>

                   {/* Delete Account - Right Side */}
                   <div className="col-md-6 mb-4">
                     <div className="card h-100">
                       <div className="card-body">
                         <h6 className="card-title text-danger">
                           <FaTrash className="me-2" />
                           Danger Zone
                         </h6>
                         <p className="text-muted mb-3">
                           Once you delete your account, there is no going back. This will permanently delete:
                         </p>
                         <ul className="text-muted mb-4">
                           <li>All your orders and order history</li>
                           <li>Your wishlist items</li>
                           <li>Your cart items</li>
                           {isOwner && (
                             <>
                               <li><strong>All your products and inventory</strong></li>
                               <li><strong>All orders associated with your products</strong></li>
                               <li><strong>Your store data and settings</strong></li>
                             </>
                           )}
                           <li>Your profile and account data</li>
                         </ul>
                         {isOwner && (
                           <div className="alert alert-warning">
                             <strong>⚠️ Warning for Store Owners:</strong> Deleting your account will also affect customers who have ordered your products. All your products will be permanently removed from the platform.
                           </div>
                         )}
                         
                         <form onSubmit={handleDeleteAccount}>
                           <div className="mb-3">
                             <label className="form-label">Enter your password</label>
                             <input
                               type="password"
                               className="form-control"
                               name="password"
                               value={deleteAccountData.password}
                               onChange={handleDeleteAccountChange}
                               placeholder="Enter your password"
                               required
                             />
                           </div>
                           <div className="mb-3">
                             <label className="form-label">Confirm password</label>
                             <input
                               type="password"
                               className="form-control"
                               name="confirmPassword"
                               value={deleteAccountData.confirmPassword}
                               onChange={handleDeleteAccountChange}
                               placeholder="Confirm your password"
                               required
                             />
                           </div>
                           <button 
                             type="submit" 
                             className="btn btn-danger"
                             disabled={deleteAccountLoading}
                           >
                             {deleteAccountLoading ? (
                               <>
                                 <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                 Deleting Account...
                               </>
                             ) : (
                               <>
                                 <FaTrash className="me-2" />
                                 Delete Account
                               </>
                             )}
                           </button>
                         </form>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 