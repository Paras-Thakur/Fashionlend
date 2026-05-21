import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaEnvelope, FaKey } from 'react-icons/fa';
import { toast } from 'react-toastify';
import VideoBackground from '../components/VideoBackground';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSendOTP = async () => {
    if (!validateForm()) {
      return;
    }

    setSendingOtp(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          purpose: 'verification'
        }),
      });

      
        const data = await response.json();
      
      if (response.ok) {
        toast.success('OTP sent to your email!');
        setStep(2);
      } else {
        toast.error(data?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    setVerifyingOtp(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp.trim(),
          purpose: 'verification'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP verified successfully!');
        setOtpVerified(true);
        // Don't automatically call handleRegistration here
        // User will click "Complete Registration" button
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegistration = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-with-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          otp: otp.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Welcome to Fashion Lend!');
        navigate('/');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSendOTP();
  };

  const handleResendOTP = async () => {
    setSendingOtp(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          purpose: 'verification'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP resent to your email!');
        setOtpVerified(false);
        setOtp('');
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const goBackToStep1 = () => {
    setStep(1);
    setOtp('');
    setOtpVerified(false);
  };

  if (step === 2) {
    return (
      <VideoBackground>
        <div className="auth-container">
          <div className="auth-card">
          <div className="auth-card-body">
            <div className="auth-header">
              <h2 className="auth-title">
                <FaKey className="me-2" />
                Verify Your Email
              </h2>
              <p className="auth-subtitle">
                We've sent a 6-digit OTP to <strong>{formData.email}</strong>
              </p>
              {otpVerified && (
                <div className="alert alert-success mt-3" role="alert">
                  <strong>✓ OTP Verified!</strong> Your email has been verified. Click "Complete Registration" to create your account.
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}>
              <div className="auth-form-group">
                <label className="auth-label">Enter OTP</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  disabled={otpVerified}
                />
              </div>

              {!otpVerified ? (
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={verifyingOtp}
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              ) : (
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={handleRegistration}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              )}
            </form>

            <div className="auth-link">
              <p className="auth-link-text">
                Didn't receive the OTP?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={sendingOtp}
                  style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {sendingOtp ? 'Sending...' : 'Resend OTP'}
                </button>
              </p>
              <p className="auth-link-text">
                <button
                  type="button"
                  onClick={goBackToStep1}
                  style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  ← Back to Registration
                </button>
              </p>
            </div>
          </div>
        </div>
        </div>
    </VideoBackground>
    );
  }

  return (
    <VideoBackground>
      <div className="auth-container">
        <div className="auth-card">
        <div className="auth-card-body">
          <div className="auth-header">
            <h2 className="auth-title">
              <FaEnvelope className="me-2" />
              Create Account
            </h2>
            <p className="auth-subtitle">
              Join Fashion Lend and start your fashion journey
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label className="auth-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className={`auth-input ${errors.firstName ? 'is-invalid' : ''}`}
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && <div className="auth-error">{errors.firstName}</div>}
              </div>
              <div>
                <label className="auth-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className={`auth-input ${errors.lastName ? 'is-invalid' : ''}`}
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <div className="auth-error">{errors.lastName}</div>}
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Username</label>
              <input
                type="text"
                name="username"
                className={`auth-input ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <div className="auth-error">{errors.username}</div>}
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Email</label>
              <input
                type="email"
                name="email"
                className={`auth-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="auth-error">{errors.email}</div>}
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                className={`auth-input ${errors.phoneNumber ? 'is-invalid' : ''}`}
                placeholder="Enter 10-digit phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength={10}
                required
              />
              {errors.phoneNumber && <div className="auth-error">{errors.phoneNumber}</div>}
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Account Type</label>
              <select
                name="role"
                className="auth-input"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">Customer</option>
                <option value="owner">Store Owner</option>
              </select>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <div className="auth-password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`auth-input ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <div className="auth-error">{errors.password}</div>}
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-password-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`auth-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <div className="auth-error">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={sendingOtp || loading}
            >
              {sendingOtp ? 'Sending OTP...' : 'Send OTP & Continue'}
            </button>
          </form>

          <div className="auth-link">
            <p className="auth-link-text">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </VideoBackground>
  );
};

export default Register; 