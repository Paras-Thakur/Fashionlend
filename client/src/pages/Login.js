import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import VideoBackground from '../components/VideoBackground';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VideoBackground>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-body">
            <div className="auth-header">
              <h1 className="auth-title">Welcome Back</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="role" className="auth-label">
                  Login As
                </label>
                <select
                  className="auth-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="user">Customer</option>
                  <option value="owner">Store Owner</option>
                </select>
              </div>

              <div className="auth-form-group">
                <label htmlFor="username" className="auth-label">
                  Username / Email / Phone
                </label>
                <input
                  type="text"
                  className="auth-input"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username, email, or phone"
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="password" className="auth-label">
                  Password
                </label>
                <div className="auth-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="auth-checkbox-container">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  id="rememberMe"
                />
                <label className="auth-checkbox-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="auth-link">
                <p className="auth-link-text">
                  Don't have an account?
                  <Link to="/register">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
};

export default Login; 