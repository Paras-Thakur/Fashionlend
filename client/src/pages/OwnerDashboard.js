import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FaPlus, FaEye, FaCheck, FaTimes, FaBox, FaShoppingCart, FaRupeeSign, FaUsers, FaSpinner, FaEdit, FaTrash, FaImage, FaWindowClose } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import { useProducts } from '../contexts/ProductContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { categories, categoryDetails, getCategories } = useProducts();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderUpdate, setShowOrderUpdate] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [orderUpdateForm, setOrderUpdateForm] = useState({
    orderStatus: '',
    paymentStatus: '',
    trackingNumber: '',
    notes: ''
  });
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockForm, setRestockForm] = useState({ mode: 'set', quantity: 1 });
  const [restocking, setRestocking] = useState(false);

  // Predefined options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const colorOptions = ['Red', 'Blue', 'Green', 'Black', 'White', 'Pink', 'Purple', 'Yellow', 'Orange', 'Brown', 'Grey', 'Gold', 'Silver', 'Navy', 'Maroon', 'Cream', 'Beige'];
  const occasionOptions = ['wedding', 'party', 'festival', 'casual', 'formal'];
  
  // Indian States for dropdown
  const stateOptions = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir'
  ];

  // Add Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    description: '',
    rentalPrice: '',
    originalPrice: '',
    sizes: [],
    colors: [],
    occasions: [],
    images: [],
    stock: 1,
    condition: 'excellent',
    fabric: '',
    brand: '',
    state: ''
  });

  useEffect(() => {
    if (user && user.role === 'owner') {
      fetchDashboardData();
      // Categories are already loaded by ProductContext, no need to call getCategories() here
    }
  }, [user]);

  // Listen for real-time new order notifications
  useEffect(() => {
    if (!socket || !isConnected || !user || user.role !== 'owner') {
      console.log('Socket listener not set up:', { 
        socket: !!socket, 
        isConnected, 
        user: !!user, 
        role: user?.role 
      });
      return;
    }

    console.log('Setting up new-order-received listener for owner:', user._id, 'Socket ID:', socket.id);

    const handleNewOrder = (data) => {
      console.log('Received new-order-received event:', data);
      const { orderId, order, products, message } = data;
      
      if (!order || !orderId) {
        console.error('Invalid order data received:', data);
        return;
      }

      // Normalize order ID for comparison
      const normalizedOrderId = orderId?.toString() || orderId;
      
      // Since we're in the owner's room, this order is definitely for this owner
      console.log('Processing new order for owner:', normalizedOrderId);
      
      // Add new order to the orders list
      setOrders(prevOrders => {
        // Check if order already exists (to avoid duplicates) - normalize IDs for comparison
        const orderExists = prevOrders.some(o => {
          const existingOrderId = o._id?.toString() || o._id;
          return existingOrderId === normalizedOrderId;
        });
        
        console.log('Order exists check:', { 
          orderExists, 
          prevOrdersCount: prevOrders.length,
          normalizedOrderId 
        });
        
        if (orderExists) {
          // Update existing order
          console.log('Updating existing order in list');
          return prevOrders.map(o => {
            const existingOrderId = o._id?.toString() || o._id;
            return existingOrderId === normalizedOrderId ? order : o;
          });
        } else {
          // Add new order at the beginning of the list
          console.log('Adding new order to beginning of list');
          return [order, ...prevOrders];
        }
      });

      // Refresh stats
      fetchStats();

      // Show toast notification
      toast.success(message || 'New order received!', {
        position: 'top-right',
        autoClose: 5000,
      });

      // If orders tab is not active, show a visual indicator
      if (activeTab !== 'orders') {
        // You could add a badge or notification indicator here
      }
    };

    socket.on('new-order-received', handleNewOrder);
    console.log('Socket listener registered for new-order-received');

    return () => {
      console.log('Cleaning up new-order-received listener');
      socket.off('new-order-received', handleNewOrder);
    };
  }, [socket, isConnected, user, activeTab]);

  // Listen for order status updates (in case order is updated by system or other owners)
  useEffect(() => {
    if (!socket || !user || user.role !== 'owner') return;

    const handleOrderStatusUpdate = (data) => {
      const { orderId, order, status, message } = data;
      
      // Update the orders list if this order is in the list
      setOrders(prevOrders => {
        const orderExists = prevOrders.some(o => o._id === orderId);
        if (orderExists) {
          return prevOrders.map(o => 
            o._id === orderId ? { 
              ...o, 
              ...order, 
              orderStatus: status || order.orderStatus || o.orderStatus 
            } : o
          );
        }
        return prevOrders;
      });

      // Refresh stats if needed
      fetchStats();
    };

    socket.on('order-status-updated', handleOrderStatusUpdate);

    return () => {
      socket.off('order-status-updated', handleOrderStatusUpdate);
    };
  }, [socket, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchOrders(),
        fetchProducts()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/orders/owner/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders/owner');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products/owner');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      await api.put(`/api/orders/${orderId}/owner-action`, { action });
      toast.success(`Order ${action} successfully`);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error(`Error ${action}ing order:`, error);
      toast.error(`Failed to ${action} order`);
    }
  };

  const handleOrderUpdate = async (e) => {
    e.preventDefault();
    if (!orderUpdateForm.orderStatus) {
      toast.error('Please select an order status');
      return;
    }

    setUpdatingOrder(true);
    try {
      await api.put(`/api/orders/${selectedOrder._id}/owner-update`, orderUpdateForm);
      toast.success('Order updated successfully!');
      
      // Refresh orders data
      await fetchOrders();
      await fetchStats();
      
      setShowOrderUpdate(false);
      setSelectedOrder(null);
      setOrderUpdateForm({ orderStatus: '', paymentStatus: '', trackingNumber: '', notes: '' });
    } catch (error) {
      console.error('Error updating order:', error);
      const message = error.response?.data?.message || 'Failed to update order';
      toast.error(message);
    } finally {
      setUpdatingOrder(false);
    }
  };

  const openOrderUpdate = (order) => {
    setSelectedOrder(order);
    setOrderUpdateForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || '',
      notes: ''
    });
    setShowOrderUpdate(true);
  };

  const handleOrderUpdateChange = (e) => {
    setOrderUpdateForm({
      ...orderUpdateForm,
      [e.target.name]: e.target.value
    });
  };

  const openRestockModal = (product) => {
    setRestockProduct(product);
    setRestockForm({
      mode: 'set',
      quantity: product.stock > 0 ? product.stock : 0
    });
    setShowRestockModal(true);
  };

  const handleRestockFormChange = (e) => {
    const { name, value } = e.target;
    setRestockForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockProduct) return;

    const quantity = parseInt(restockForm.quantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Quantity must be 0 or greater');
      return;
    }

    setRestocking(true);
    try {
      await api.patch(`/api/products/${restockProduct._id}/restock`, {
        quantity,
        mode: restockForm.mode
      });
      toast.success(restockForm.mode === 'add' ? 'Product restocked successfully' : 'Stock updated successfully');
      await fetchProducts();
      setShowRestockModal(false);
      setRestockProduct(null);
      setRestockForm({ mode: 'set', quantity: 1 });
    } catch (error) {
      console.error('Error restocking product:', error);
      const message = error.response?.data?.message || 'Failed to update stock';
      toast.error(message);
    } finally {
      setRestocking(false);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (size) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorChange = (color) => {
    setProductForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleOccasionChange = (occasion) => {
    setProductForm(prev => ({
      ...prev,
      occasions: prev.occasions.includes(occasion)
        ? prev.occasions.filter(o => o !== occasion)
        : [...prev.occasions, occasion]
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    if (productForm.images.length + files.length > 6) {
      toast.error('Total images cannot exceed 6');
      return;
    }

    try {
      setUploadingImages(true);
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/api/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...response.data.images.map(img => img.imageUrl)]
      }));

      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    // Validate required fields before submission
    if (!productForm.name || !productForm.category || !productForm.description || 
        !productForm.rentalPrice || !productForm.originalPrice || !productForm.state) {
      toast.error('Please fill in all required fields: Name, Category, Description, Rental Price, Original Price, and State');
      return;
    }
    
    // Ensure at least one image is provided
    if (!productForm.images || productForm.images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }
    
    try {
      console.log('Submitting product form:', productForm);
      
      // Prepare the data with proper type conversions
      const productData = {
        ...productForm,
        rentalPrice: parseFloat(productForm.rentalPrice),
        originalPrice: parseFloat(productForm.originalPrice),
        stock: parseInt(productForm.stock) || 1
      };
      
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/api/products', productData);
        toast.success('Product added successfully');
      }
      
      setShowAddProduct(false);
      setEditingProduct(null);
      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Failed to save product';
      toast.error(errorMessage);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description,
      rentalPrice: product.rentalPrice,
      originalPrice: product.originalPrice,
      sizes: product.sizes || [],
      colors: product.colors || [],
      occasions: product.occasions || [],
      images: product.images || [],
      stock: product.stock,
      condition: product.condition,
      fabric: product.fabric || '',
      brand: product.brand || '',
      state: product.state || ''
    });
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      description: '',
      rentalPrice: '',
      originalPrice: '',
      sizes: [],
      colors: [],
      occasions: [],
      images: [],
      stock: 1,
      condition: 'excellent',
      fabric: '',
      brand: '',
      state: ''
    });
  };

  // Organize categories by type for better dropdown
  const organizeCategoriesByType = () => {
    if (categoryDetails && categoryDetails.length > 0) {
      const organized = {
        'Women\'s Collection': [],
        'Men\'s Collection': [],
        'Traditional': [],
        'Other': []
      };
      
      categoryDetails.forEach(cat => {
        const displayName = cat.displayName || cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
        const categoryOption = { value: cat.name, label: displayName, description: cat.description };
        
        if (cat.type === 'womens') {
          organized['Women\'s Collection'].push(categoryOption);
        } else if (cat.type === 'mens') {
          organized['Men\'s Collection'].push(categoryOption);
        } else if (cat.type === 'traditional') {
          organized['Traditional'].push(categoryOption);
        } else {
          organized['Other'].push(categoryOption);
        }
      });
      
      return organized;
    }
    
    // Fallback to simple list if no category details
    const fallbackCategories = [
      'lehenga', 'anarkali', 'gown', 'sherwani', 'indo-western', 'tuxedo', 'bridal',
      'shirts', 'blazers', 'jackets', 'coats', 'pants', 'sweaters',
      'weightless-lehengas', 'kitty-special', 'festive-special', 'kurtis', 'haldi-special',
      'saree', 'salwar-kameez', 'dhoti-kurta', 'kurta-pyjama', 'palazzo-suits', 
      'crop-top-lehenga', 'dress-material', 'ethnic-sets'
    ];
    
    return {
      'All Categories': fallbackCategories.map(cat => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1)
      }))
    };
  };
  
  const organizedCategories = organizeCategoriesByType();

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
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (!user || user.role !== 'owner') {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h3>Access Denied</h3>
          <p>You need owner privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <FaSpinner className="fa-spin" size={48} />
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h2">Owner Dashboard</h1>
          <p className="text-muted">Manage your products and orders</p>
        </div>
        <div className="col-md-6 text-md-end">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAddProduct(true);
              setEditingProduct(null);
              resetProductForm();
            }}
          >
            <FaPlus className="me-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.totalProducts || 0}</h4>
                  <small>Total Products</small>
                </div>
                <div className="align-self-center">
                  <FaBox size={24} />
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
                  <FaShoppingCart size={24} />
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
                  <h4 className="mb-0">₹{stats.totalRevenue || 0}</h4>
                  <small>Total Revenue</small>
                </div>
                <div className="align-self-center">
                  <FaRupeeSign size={24} />
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
                  <h4 className="mb-0">{stats.totalCustomers || 0}</h4>
                  <small>Total Customers</small>
                </div>
                <div className="align-self-center">
                  <FaUsers size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products ({products.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Recent Orders</h5>
              </div>
              <div className="card-body">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                    <div>
                      <strong>Order #{order._id.toString().slice(-6)}</strong>
                      <br />
                      <small className="text-muted">
                        {order.user?.firstName} {order.user?.lastName} - ₹{order.totalAmount}
                      </small>
                    </div>
                    <div className="text-end">
                      <span className={`badge bg-${getStatusColor(order.orderStatus)} me-2`}>
                        {order.orderStatus.toUpperCase()}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setActiveTab('orders')}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-muted text-center">No orders yet</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowAddProduct(true);
                      setActiveTab('products');
                    }}
                  >
                    <FaPlus className="me-2" />
                    Add New Product
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setActiveTab('orders')}
                  >
                    <FaEye className="me-2" />
                    View All Orders
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setActiveTab('products')}
                  >
                    <FaBox className="me-2" />
                    Manage Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Orders for Your Products</h5>
          </div>
          <div className="card-body">
            {orders.length === 0 ? (
              <p className="text-muted text-center">No orders found for your products</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Products</th>
                      <th>Amount</th>
                      <th>Order Status</th>
                      <th>Payment Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.toString().slice(-6)}</td>
                        <td>
                          {order.user?.firstName} {order.user?.lastName}
                          <br />
                          <small className="text-muted">{order.user?.email}</small>
                        </td>
                        <td>
                          {order.items.map((item, index) => (
                            <div key={index}>
                              {item.product?.name} (Qty: {item.quantity})
                            </div>
                          ))}
                        </td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => window.open(`/orders/${order._id}`, '_blank')}
                              title="View Order Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openOrderUpdate(order)}
                              title="Update Order Status"
                            >
                              <FaEdit />
                            </button>
                            {order.orderStatus === 'pending' && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleOrderAction(order._id, 'accept')}
                                  title="Accept Order"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleOrderAction(order._id, 'reject')}
                                  title="Reject Order"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Your Products</h5>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowAddProduct(true);
                setEditingProduct(null);
                resetProductForm();
              }}
            >
              <FaPlus className="me-2" />
              Add Product
            </button>
          </div>
          <div className="card-body">
            {products.length === 0 ? (
              <p className="text-muted text-center">No products added yet</p>
            ) : (
              <div className="row">
                {products.map((product) => (
                  <div key={product._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/300x200?text=Product'}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <h6 className="card-title">{product.name}</h6>
                        <p className="card-text text-muted">{product.category}</p>
                        <p className="card-text">
                          <strong>₹{product.rentalPrice}</strong>/day
                        </p>
                        <p className="card-text">
                          <small className={!product.availability || product.stockStatus === 'out_of_stock' ? 'text-danger' : 'text-muted'}>
                            Stock: {!product.availability || product.stockStatus === 'out_of_stock' ? 'Out of Stock' : product.stock}
                          </small>
                        </p>
                        {product.occasions && product.occasions.length > 0 && (
                          <div className="mb-2">
                            {product.occasions.map((occasion, index) => (
                              <span key={index} className="badge bg-secondary me-1">
                                {occasion}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="card-footer">
                        <div className="btn-group w-100">
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => openRestockModal(product)}
                            title="Restock product"
                          >
                            <FaPlus />
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmitProduct}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        name="category"
                        value={productForm.category}
                        onChange={handleProductFormChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {Object.entries(organizedCategories).map(([groupName, groupCategories]) => (
                          <optgroup key={groupName} label={groupName}>
                            {groupCategories.map(category => (
                              <option key={category.value} value={category.value} title={category.description}>
                                {category.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <small className="text-muted">
                        Categories are organized by collection type for easier selection
                      </small>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Rental Price (per day)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="rentalPrice"
                        value={productForm.rentalPrice}
                        onChange={handleProductFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Original Price</label>
                      <input
                        type="number"
                        className="form-control"
                        name="originalPrice"
                        value={productForm.originalPrice}
                        onChange={handleProductFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        name="stock"
                        value={productForm.stock}
                        onChange={handleProductFormChange}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fabric</label>
                      <input
                        type="text"
                        className="form-control"
                        name="fabric"
                        value={productForm.fabric}
                        onChange={handleProductFormChange}
                        placeholder="e.g., Silk, Cotton, Georgette"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Brand</label>
                      <input
                        type="text"
                        className="form-control"
                        name="brand"
                        value={productForm.brand}
                        onChange={handleProductFormChange}
                        placeholder="Brand name"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Condition</label>
                      <select
                        className="form-select"
                        name="condition"
                        value={productForm.condition}
                        onChange={handleProductFormChange}
                        required
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State</label>
                      <select
                        className="form-select"
                        name="state"
                        value={productForm.state}
                        onChange={handleProductFormChange}
                        required
                      >
                        <option value="">Select State</option>
                        {stateOptions.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sizes Selection */}
                  <div className="mb-3">
                    <label className="form-label">Available Sizes</label>
                    <div className="d-flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <div key={size} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`size-${size}`}
                            checked={productForm.sizes.includes(size)}
                            onChange={() => handleSizeChange(size)}
                          />
                          <label className="form-check-label" htmlFor={`size-${size}`}>
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Colors Selection */}
                  <div className="mb-3">
                    <label className="form-label">Available Colors</label>
                    <div className="d-flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <div key={color} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`color-${color}`}
                            checked={productForm.colors.includes(color)}
                            onChange={() => handleColorChange(color)}
                          />
                          <label className="form-check-label" htmlFor={`color-${color}`}>
                            {color}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Occasions Selection */}
                  <div className="mb-3">
                    <label className="form-label">Suitable Occasions</label>
                    <div className="d-flex flex-wrap gap-2">
                      {occasionOptions.map((occasion) => (
                        <div key={occasion} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`occasion-${occasion}`}
                            checked={productForm.occasions.includes(occasion)}
                            onChange={() => handleOccasionChange(occasion)}
                          />
                          <label className="form-check-label" htmlFor={`occasion-${occasion}`}>
                            {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>



                  {/* Image Upload */}
                  <div className="mb-3">
                    <label className="form-label">
                      Product Images (Max 6 images)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages || productForm.images.length >= 6}
                    />
                    <small className="text-muted">
                      {productForm.images.length}/6 images uploaded
                    </small>
                    {uploadingImages && (
                      <div className="mt-2">
                        <FaSpinner className="fa-spin me-2" />
                        Uploading images...
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {productForm.images.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Uploaded Images</label>
                      <div className="row">
                        {productForm.images.map((image, index) => (
                          <div key={index} className="col-md-3 mb-2">
                            <div className="position-relative">
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="img-fluid rounded"
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                onClick={() => removeImage(index)}
                                style={{ margin: '5px' }}
                              >
                                <FaWindowClose />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                      resetProductForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && restockProduct && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Restock {restockProduct.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRestockModal(false);
                    setRestockProduct(null);
                    setRestockForm({ mode: 'set', quantity: 1 });
                  }}
                ></button>
              </div>
              <form onSubmit={handleRestockSubmit}>
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Current Stock:{' '}
                    <strong>
                      {restockProduct.stockStatus === 'out_of_stock' ? 'Out of Stock' : restockProduct.stock}
                    </strong>
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Update Mode</label>
                    <select
                      className="form-select"
                      name="mode"
                      value={restockForm.mode}
                      onChange={handleRestockFormChange}
                    >
                      <option value="set">Set exact quantity</option>
                      <option value="add">Add to existing stock</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {restockForm.mode === 'add' ? 'Quantity to add' : 'New stock quantity'}
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={restockForm.quantity}
                      min="0"
                      onChange={handleRestockFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowRestockModal(false);
                      setRestockProduct(null);
                      setRestockForm({ mode: 'set', quantity: 1 });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={restocking}>
                    {restocking ? (
                      <>
                        <FaSpinner className="fa-spin me-2" />
                        Updating...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Update Modal */}
      {showOrderUpdate && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Update Order Status - #{selectedOrder._id.toString().slice(-6)}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowOrderUpdate(false);
                    setSelectedOrder(null);
                    setOrderUpdateForm({ orderStatus: '', trackingNumber: '', notes: '' });
                  }}
                ></button>
              </div>
              <form onSubmit={handleOrderUpdate}>
                <div className="modal-body">
                  {/* Order Information */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6>Customer Information</h6>
                      <p className="mb-1">
                        <strong>Name:</strong> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                      </p>
                      <p className="mb-1">
                        <strong>Email:</strong> {selectedOrder.user?.email}
                      </p>
                      <p className="mb-0">
                        <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6>Current Status</h6>
                      <p className="mb-1">
                        <strong>Order Status:</strong> 
                        <span className={`badge bg-${getStatusColor(selectedOrder.orderStatus)} ms-2`}>
                          {selectedOrder.orderStatus.toUpperCase()}
                        </span>
                      </p>
                      <p className="mb-1">
                        <strong>Payment Status:</strong> 
                        <span className={`badge bg-${getPaymentStatusColor(selectedOrder.paymentStatus)} ms-2`}>
                          {selectedOrder.paymentStatus.toUpperCase()}
                        </span>
                      </p>
                      <p className="mb-0">
                        <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
                      </p>
                    </div>
                  </div>

                  {/* Update Form */}
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label htmlFor="orderStatus" className="form-label">
                        Order Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="orderStatus"
                        name="orderStatus"
                        value={orderUpdateForm.orderStatus}
                        onChange={handleOrderUpdateChange}
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
                    <div className="col-md-3 mb-3">
                      <label htmlFor="paymentStatus" className="form-label">
                        Payment Status
                      </label>
                      <select
                        className="form-select"
                        id="paymentStatus"
                        name="paymentStatus"
                        value={orderUpdateForm.paymentStatus}
                        onChange={handleOrderUpdateChange}
                      >
                        <option value="">Select Payment Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <small className="form-text text-muted">
                        Update to "Paid" when COD payment is received
                      </small>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="trackingNumber" className="form-label">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="trackingNumber"
                        name="trackingNumber"
                        value={orderUpdateForm.trackingNumber}
                        onChange={handleOrderUpdateChange}
                        placeholder="Enter tracking number"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="notes" className="form-label">
                        Notes
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="notes"
                        name="notes"
                        value={orderUpdateForm.notes}
                        onChange={handleOrderUpdateChange}
                        placeholder="Add any notes"
                      />
                    </div>
                  </div>

                  {/* Tracking History */}
                  {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 && (
                    <div className="mb-3">
                      <h6>Tracking History</h6>
                      <div className="timeline">
                        {selectedOrder.trackingHistory.map((entry, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-marker">
                              <div className={`timeline-dot bg-${getStatusColor(entry.status)}`}></div>
                            </div>
                            <div className="timeline-content">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1 text-capitalize">{entry.status}</h6>
                                  <p className="mb-1 text-muted">{entry.description}</p>
                                </div>
                                <small className="text-muted">
                                  {new Date(entry.updatedAt).toLocaleString('en-IN')}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowOrderUpdate(false);
                      setSelectedOrder(null);
                      setOrderUpdateForm({ orderStatus: '', paymentStatus: '', trackingNumber: '', notes: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updatingOrder}
                  >
                    {updatingOrder ? (
                      <>
                        <FaSpinner className="fa-spin me-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Order'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard; 