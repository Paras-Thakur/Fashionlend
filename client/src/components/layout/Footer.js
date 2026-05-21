import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHeart, 
  FaTruck, 
  FaCrown,
  FaMale
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-content">
        {/* Main Footer Section */}
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-logo">👗</span>
            <span className="footer-title">Fashion Lend</span>
            <p className="footer-tagline">Rent. Style. Repeat.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <div className="quick-links-horizontal">
                <h6>Quick Links</h6>
                <Link to="/products/category/lehenga"><FaCrown /> Bridal Rental</Link>
                <Link to="/products/category/sherwani"><FaMale /> Groom Rental</Link>
                <Link to="/track-order"><FaTruck /> Track Order</Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; 2024 Fashion Lend. Made with <FaHeart className="heart-icon" /> for fashion lovers</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 