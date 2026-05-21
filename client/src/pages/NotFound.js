import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h1 className="display-1 text-muted">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="lead text-muted mb-5">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/" className="btn btn-primary">
                <FaHome className="me-2" />
                Go Home
              </Link>
              <Link to="/products" className="btn btn-outline-primary">
                <FaSearch className="me-2" />
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 