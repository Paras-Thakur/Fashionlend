import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaCreditCard, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, loading, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});

  // Check if user is owner (not admin)
  const isOwner = user && user.role === 'owner' && !user.isAdmin;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (isOwner) {
      // Redirect owners to their dashboard
      navigate('/owner-dashboard');
      toast.info('Store owners don\'t have access to shopping cart.');
    }
  }, [user, navigate, isOwner]);

  const handleQuantityChange = async (productId, newQuantity) => {
    const numValue = parseInt(newQuantity) || 1;
    if (numValue < 1) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await updateCartItem(productId, { quantity: numValue });
    } catch (error) {
      console.error('Update quantity error:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRentalDurationChange = async (productId, newDuration) => {
    const numValue = parseInt(newDuration) || 1;
    if (numValue < 1) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await updateCartItem(productId, { rentalDuration: numValue });
    } catch (error) {
      console.error('Update rental duration error:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item from cart?')) {
      await removeFromCart(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your cart.</p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Show message for owners
  if (isOwner) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>Access Restricted</h2>
          <p>Store owners don't have access to shopping cart functionality.</p>
          <Link to="/owner-dashboard" className="btn btn-primary">
            Go to Store Dashboard
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
          <h1 className="h2">
            <FaShoppingCart className="me-2" />
            Shopping Cart
          </h1>
          <p className="text-muted">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <div className="col-md-6 text-md-end">
          <Link to="/products" className="btn btn-outline-secondary me-2">
            <FaArrowLeft className="me-2" />
            Continue Shopping
          </Link>
          {cartItems.length > 0 && (
            <button onClick={handleClearCart} className="btn btn-outline-danger">
              <FaTrash className="me-2" />
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <FaShoppingCart size={64} className="text-muted mb-3" />
          <h3>Your cart is empty</h3>
          <p className="text-muted mb-4">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="row">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                {cartItems.map((item, index) => (
                  <div key={index} className="row mb-4 pb-4 border-bottom cart-item">
                    <div className="col-md-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="img-fluid rounded cart-item"
                        style={{ maxHeight: '120px' }}
                      />
                    </div>
                    <div className="col-md-9">
                      <div className="row">
                        <div className="col-md-6">
                          <h5 className="mb-2">{item.productName}</h5>
                          <p className="text-muted mb-2">
                            <strong>Size:</strong> {item.size || 'Not specified'}
                          </p>
                          <p className="text-muted mb-2">
                            <strong>Color:</strong> {item.color || 'Not specified'}
                          </p>
                          <p className="text-muted mb-2">
                            <strong>Price:</strong> ₹{item.rentalPrice}/day
                          </p>
                        </div>
                        <div className="col-md-6">
                          <div className="row">
                            <div className="col-6">
                              <label className="form-label">Quantity</label>
                              <div className="input-group">
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleQuantityChange(item.product || item.productId, item.quantity - 1)}
                                  disabled={updating[item.product || item.productId]}
                                >
                                  <FaChevronDown />
                                </button>
                                <input
                                  type="number"
                                  className="form-control text-center"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.product || item.productId, e.target.value)}
                                  min="1"
                                  disabled={updating[item.product || item.productId]}
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleQuantityChange(item.product || item.productId, item.quantity + 1)}
                                  disabled={updating[item.productId]}
                                >
                                  <FaChevronUp />
                                </button>
                              </div>
                            </div>
                            <div className="col-6">
                              <label className="form-label">Duration (days)</label>
                              <div className="input-group">
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleRentalDurationChange(item.product || item.productId, item.rentalDuration - 1)}
                                  disabled={updating[item.product || item.productId]}
                                >
                                  <FaChevronDown />
                                </button>
                                <input
                                  type="number"
                                  className="form-control text-center"
                                  value={item.rentalDuration}
                                  onChange={(e) => handleRentalDurationChange(item.product || item.productId, e.target.value)}
                                  min="1"
                                  disabled={updating[item.product || item.productId]}
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleRentalDurationChange(item.product || item.productId, item.rentalDuration + 1)}
                                  disabled={updating[item.product || item.productId]}
                                >
                                  <FaChevronUp />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="mb-1">
                              <strong>Total:</strong> ₹{item.totalPrice}
                            </p>
                            <button
                              onClick={() => handleRemoveItem(item.product || item.productId)}
                              className="btn btn-sm btn-outline-danger"
                              disabled={updating[item.product || item.productId]}
                            >
                              <FaTrash className="me-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (18% GST):</span>
                  <span>₹{(getCartTotal() * 0.18).toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong>₹{(getCartTotal() * 1.18).toFixed(2)}</strong>
                </div>
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary w-100"
                  disabled={cartItems.length === 0}
                >
                  <FaCreditCard className="me-2" />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 