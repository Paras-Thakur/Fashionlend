import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaMapMarkerAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
    phone: user?.phoneNumber || ''
  });

  const [rentalDates, setRentalDates] = useState({
    startDate: '',
    endDate: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [advancePayment, setAdvancePayment] = useState(0);

  // Calculate totals
  const subtotal = getCartTotal();
  const shippingCost = 0; // Free shipping
  const tax = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + shippingCost + tax;
  const remainingPayment = totalAmount - advancePayment;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Set default rental dates (next day to 3 days later)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);

    setRentalDates({
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, [user, cartItems, navigate]);

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (e) => {
    setRentalDates({
      ...rentalDates,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || 
        !shippingAddress.zipCode || !shippingAddress.phone) {
      toast.error('Please fill in all shipping address fields');
      return false;
    }

    if (!rentalDates.startDate || !rentalDates.endDate) {
      toast.error('Please select rental dates');
      return false;
    }

    const startDate = new Date(rentalDates.startDate);
    const endDate = new Date(rentalDates.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error('Start date cannot be in the past');
      return false;
    }

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return false;
    }

    if (advancePayment < 0 || advancePayment > totalAmount) {
      toast.error('Invalid advance payment amount');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product || item.productId,
          quantity: item.quantity,
          rentalDuration: item.rentalDuration,
          size: item.size,
          color: item.color,
          rentalPrice: item.rentalPrice,
          totalPrice: item.totalPrice
        })),
        rentalDates: {
          startDate: rentalDates.startDate,
          endDate: rentalDates.endDate
        },
        shippingAddress,
        paymentMethod,
        advancePayment: parseFloat(advancePayment)
      };

      const response = await api.post('/api/orders', orderData);
      
      toast.success('Order placed successfully!');
      
      // Clear cart after successful order
      await clearCart();
      
      // Navigate to order confirmation
      navigate(`/orders/${response.data.order._id}`);
    } catch (error) {
      console.error('Order placement error:', error);
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateForm()) return;
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <button 
            onClick={() => navigate('/cart')} 
            className="btn btn-outline-secondary mb-3"
          >
            <FaArrowLeft className="me-2" />
            Back to Cart
          </button>
          <h1 className="h2">Checkout</h1>
        </div>
        <div className="col-md-6">
          <div className="d-flex justify-content-end">
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Shipping</span>
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Payment</span>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Checkout Form */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div>
                  <h4 className="mb-4">
                    <FaMapMarkerAlt className="me-2" />
                    Shipping Information
                  </h4>
                  
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="street"
                        value={shippingAddress.street}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5>
                      <FaCalendarAlt className="me-2" />
                      Rental Dates
                    </h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="startDate"
                          value={rentalDates.startDate}
                          onChange={handleDateChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="endDate"
                          value={rentalDates.endDate}
                          onChange={handleDateChange}
                          min={rentalDates.startDate}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={nextStep}
                      className="btn btn-primary"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <div>
                  <h4 className="mb-4">
                    <FaCreditCard className="me-2" />
                    Payment Method
                  </h4>

                  <div className="mb-4">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="cod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="cod">
                        <FaMoneyBillWave className="me-2" />
                        Cash on Delivery (COD)
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="online"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="online">
                        <FaCreditCard className="me-2" />
                        Online Payment
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="card"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="card">
                        <FaCreditCard className="me-2" />
                        Credit/Debit Card
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Advance Payment (Optional)</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        value={advancePayment}
                        onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                        min="0"
                        max={totalAmount}
                        step="0.01"
                      />
                    </div>
                    <small className="text-muted">
                      Pay a partial amount now and the rest on delivery
                    </small>
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={prevStep}
                      className="btn btn-outline-secondary me-2"
                    >
                      Back
                    </button>
                    <button 
                      onClick={nextStep}
                      className="btn btn-primary"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <div>
                  <h4 className="mb-4">
                    <FaCheck className="me-2" />
                    Review Your Order
                  </h4>

                  <div className="mb-4">
                    <h6>Shipping Address</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-1">{shippingAddress.street}</p>
                        <p className="mb-1">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                        <p className="mb-1">{shippingAddress.country}</p>
                        <p className="mb-0">Phone: {shippingAddress.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6>Rental Dates</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-0">
                          From {new Date(rentalDates.startDate).toLocaleDateString()} to {new Date(rentalDates.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6>Payment Method</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p className="mb-1">
                          {paymentMethod === 'cod' && 'Cash on Delivery (COD)'}
                          {paymentMethod === 'online' && 'Online Payment'}
                          {paymentMethod === 'card' && 'Credit/Debit Card'}
                        </p>
                        {advancePayment > 0 && (
                          <p className="mb-0">Advance Payment: ₹{advancePayment}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={prevStep}
                      className="btn btn-outline-secondary me-2"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handlePlaceOrder}
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              {/* Cart Items */}
              <div className="mb-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="d-flex mb-2 pb-2 border-bottom">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="rounded me-3"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{item.productName}</h6>
                      <p className="text-muted mb-1">
                        Size: {item.size} | Qty: {item.quantity} | Duration: {item.rentalDuration} days
                      </p>
                      <p className="mb-0">₹{item.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (18% GST):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                {advancePayment > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Advance Payment:</span>
                    <span className="text-success">-₹{advancePayment.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <strong>Total:</strong>
                  <strong>₹{totalAmount.toFixed(2)}</strong>
                </div>
                {advancePayment > 0 && (
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Remaining:</span>
                    <span className="text-muted">₹{remainingPayment.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rental Information */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Rental Information</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <small className="text-muted">
                    <FaCheck className="me-1 text-success" />
                    Free trial available
                  </small>
                </li>
                <li className="mb-2">
                  <small className="text-muted">
                    <FaCheck className="me-1 text-success" />
                    Easy returns
                  </small>
                </li>
                <li className="mb-2">
                  <small className="text-muted">
                    <FaCheck className="me-1 text-success" />
                    Quality check & hygiene
                  </small>
                </li>
                <li className="mb-2">
                  <small className="text-muted">
                    <FaCheck className="me-1 text-success" />
                    Pan India delivery
                  </small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 