import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaHeart, FaComment } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReviewForm from './ReviewForm';

const ProductCard = ({ product, children, hideWishlistButtons = false }) => {

  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);

  // Check if product has multiple images
  const hasMultipleImages = product?.images && product.images.length > 1;

  // Auto-play carousel on hover
  useEffect(() => {
    if (hasMultipleImages && isAutoPlaying && product?.images) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % product.images.length
        );
      }, 1500); // Change image every 1.5 seconds for faster carousel

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [hasMultipleImages, isAutoPlaying, product?.images]);

  // Removed debug logging

  // Early return if product is null or undefined
  if (!product) {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0 text-muted">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Start carousel on hover, revert to first image on leave
  const handleMouseEnter = () => {
    if (hasMultipleImages) {
      setIsAutoPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasMultipleImages) {
      setIsAutoPlaying(false);
      setCurrentImageIndex(0); // Revert to first image
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      await toggleWishlist(product._id);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewClick = () => {
    if (!user) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = (reviewData) => {
    setShowReviewModal(false);
    toast.success('Review submitted successfully!');
    // Optionally refresh the product data or update the UI
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? 'text-warning' : 'text-muted'}
          size={14}
        />
      );
    }
    return stars;
  };

  const hasStockValue = typeof product?.stock === 'number';
  const stockCount = hasStockValue ? product.stock : 0;
  const stockStatus = product?.stockStatus || (stockCount > 0 ? 'in_stock' : 'out_of_stock');
  const availabilityFlag = typeof product?.availability === 'boolean'
    ? product.availability
    : stockCount > 0;
  const isOutOfStock = !availabilityFlag || stockStatus === 'out_of_stock' || (hasStockValue && stockCount <= 0);

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (product.originalPrice && product.rentalPrice) {
      return Math.round(((product.originalPrice - product.rentalPrice) / product.originalPrice) * 100);
    }
    return 0;
  };

  const discountPercentage = calculateDiscount();

  return (
    <div className="card h-100 product-card" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div 
        className="position-relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Carousel */}
        <div className="product-image-container">
          <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
              src={product.images[currentImageIndex]}
              className="card-img-top"
              alt={`${product.name} - ${currentImageIndex + 1} of ${product.images.length}`}
              style={{ cursor: 'pointer', height: '300px', objectFit: 'cover' }}
            />
          </Link>

          {isOutOfStock && (
            <span 
              className="badge position-absolute top-0 start-0 m-2" 
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '600',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 10
              }}
            >
              Out of Stock
            </span>
          )}
          


          {/* Rating Overlay - Bottom Left */}
          <div className="position-absolute bottom-0 start-0 p-2" style={{ zIndex: 10 }}>
            <div className="d-flex align-items-center" style={{
              backgroundColor: 'rgba(248, 249, 250, 0.9)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: '#495057', fontWeight: '500' }}>{product.rating || 0}</span>
              <FaStar className="text-warning ms-1" size={12} />
              <span style={{ color: '#6c757d', marginLeft: '4px' }}>|</span>
              <span style={{ color: '#6c757d', marginLeft: '4px' }}>{product.reviews ? product.reviews.length : 0}</span>
            </div>
          </div>
          
          {/* Image Indicators (Dots) - Only show if multiple images */}
          {hasMultipleImages && (
            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2">
              <div className="d-flex gap-1">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-circle ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                    style={{ 
                      width: '8px',
                      height: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>


      </div>

      <div className="card-body d-flex flex-column" style={{ padding: '1rem' }}>
        {/* Brand Name - Large and Bold */}
        <h6 className="card-title mb-1" style={{ 
          fontSize: '1.1rem', 
          fontWeight: '700',
          color: '#212529',
          lineHeight: '1.2'
        }}>
          {product.brand || 'Brand Name'}
        </h6>
        
        {/* Product Type - Smaller text */}
        <p className="mb-2" style={{ 
          fontSize: '0.9rem', 
          color: '#6c757d',
          lineHeight: '1.3'
        }}>
          {product.name}
        </p>

        {/* Pricing Section */}
        <div className="mb-3">
          <div className="d-flex align-items-center">
            <span className="h5 mb-0" style={{ 
              fontSize: '1.2rem', 
              fontWeight: '700',
              color: '#212529'
            }}>
              ₹{product.rentalPrice}
            </span>
            {product.originalPrice > product.rentalPrice && (
              <span className="text-muted text-decoration-line-through ms-2" style={{ fontSize: '0.9rem' }}>
                ₹{product.originalPrice}
              </span>
            )}

          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto">
          <div className="d-grid gap-2">
            {/* Render children if provided, otherwise default View Details link */}
            {typeof children !== 'undefined' ? children : (
              <Link to={`/products/${product._id}`} className="btn btn-outline-secondary" style={{
                borderColor: '#007bff',
                color: '#007bff',
                fontSize: '0.85rem',
                padding: '0.375rem 0.75rem'
              }}>
                View Details
              </Link>
            )}
            
            {!hideWishlistButtons && (
              <>
                {product._id && isWishlisted(product._id) ? (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    style={{
                      borderColor: '#dc3545',
                      color: '#dc3545',
                      fontSize: '0.85rem',
                      padding: '0.375rem 0.75rem',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc3545';
                      e.target.style.color = 'white';
                      e.target.querySelector('svg').style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#dc3545';
                      e.target.querySelector('svg').style.color = '#dc3545';
                    }}
                  >
                    {wishlistLoading ? (
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    ) : (
                      <FaHeart className="me-2" style={{ color: '#dc3545' }} />
                    )}
                    Remove from Wishlist
                  </button>
                ) : (
                  <button
                    className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading || isOutOfStock}
                  >
                    {wishlistLoading ? (
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    ) : (
                      <FaHeart className="me-2" />
                    )}
                    {isOutOfStock ? 'Out of Stock' : 'Add to Wishlist'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div 
          className="modal fade show d-block" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReviewModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ zIndex: 1055 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Write a Review for {product.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReviewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ReviewForm
                  productId={product._id}
                  onReviewSubmitted={handleReviewSubmitted}
                  onCancel={() => setShowReviewModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard; 