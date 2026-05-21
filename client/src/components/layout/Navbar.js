import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHeart, FaSearch, FaCrown, FaMale, FaTruck, FaHeadset } from 'react-icons/fa';
import SearchSuggestions from '../SearchSuggestions';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown and suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchInputFocus = () => {
    if (searchTerm.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDropdownItemClick = (path) => {
    setShowDropdown(false);
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  // Check if user is owner (not admin)
  const isOwner = user && user.role === 'owner' && !user.isAdmin;

  return (
    <div className="navbar">
      <Link className="navbar-brand" to="/home">
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>👗</span>
        Fashion Lend
      </Link>

      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleSearch} className="desktop-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search products, categories..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onFocus={handleSearchInputFocus}
          />
          <button type="submit" className="search-btn">
            <FaSearch />
          </button>
        </form>
        
        {showSuggestions && (
          <SearchSuggestions
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onClose={() => setShowSuggestions(false)}
          />
        )}
      </div>

      <div className="nav-items">
        <Link to="/products/category/lehenga" className="desktop-nav-item" id="brideContainer">
          <span className="desktop-icon">
            <FaCrown />
          </span>
          <span className="desktop-userTitle">Bridal Rental</span>
        </Link>

        <Link to="/products/category/sherwani" className="desktop-nav-item" id="groomrental">
          <span className="desktop-icon">
            <FaMale />
          </span>
          <span className="desktop-userTitle">Groom Rental</span>
        </Link>

        <Link to="/track-order" className="desktop-nav-item">
          <span className="desktop-icon">
            <FaTruck />
          </span>
          <span className="desktop-userTitle">Track Order</span>
        </Link>

        <Link to="/support" className="desktop-nav-item">
          <span className="desktop-icon">
            <FaHeadset />
          </span>
          <span className="desktop-userTitle">Support</span>
        </Link>

        {/* Hide wishlist link for owners */}
        {!isOwner && (
          <Link to="/wishlist" className="desktop-wishlist" id="wishlist">
            <span className="desktop-icon">
              <FaHeart />
            </span>
            <span className="desktop-userTitle">Wishlist</span>
          </Link>
        )}

        {/* Hide cart link for owners */}
        {!isOwner && (
          <Link to="/cart" className="desktop-cart" id="cart">
            <span className="desktop-icon">
              <FaShoppingCart />
            </span>
            <span className="desktop-userTitle">Cart</span>
          </Link>
        )}
        
        {user ? (
          <div className="dropdown" ref={dropdownRef}>
            <div
              className="desktop-profile"
              onClick={toggleDropdown}
              style={{ cursor: 'pointer' }}
            >
              <span className="desktop-icon">
                <FaUser />
              </span>
              <span className="desktop-userTitle">{user.firstName}</span>
            </div>
            {showDropdown && (
              <div className="dropdown-content">
                <button 
                  className="dropdown-item" 
                  onClick={() => handleDropdownItemClick('/profile')}
                >
                  My Profile
                </button>
                {/* Hide My Orders for owners */}
                {!isOwner && (
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleDropdownItemClick('/orders')}
                  >
                    My Orders
                  </button>
                )}
                {/* Hide My Wishlist for owners */}
                {!isOwner && (
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleDropdownItemClick('/wishlist')}
                  >
                    <FaHeart className="me-2" />
                    My Wishlist ({wishlistCount})
                  </button>
                )}
                {user.role === 'owner' && (
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleDropdownItemClick('/owner-dashboard')}
                  >
                    My Store Dashboard
                  </button>
                )}
                {user.isAdmin && (
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleDropdownItemClick('/admin')}
                  >
                    Admin Dashboard
                  </button>
                )}
                <button onClick={handleLogout} className="dropdown-item">
                  <FaSignOutAlt className="me-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="desktop-profile">
            <span className="desktop-icon">
              <FaUser />
            </span>
            <span className="desktop-userTitle">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar; 