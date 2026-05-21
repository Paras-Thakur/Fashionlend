import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import api from '../utils/axios';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rentalDuration, setRentalDuration] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
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
      }, 2000); // Change image every 2 seconds for faster carousel

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [hasMultipleImages, isAutoPlaying, product?.images]);

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



  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
      // Set default selections
      if (res.data.sizes && res.data.sizes.length > 0) {
        setSelectedSize(res.data.sizes[0]);
      }
      if (res.data.colors && res.data.colors.length > 0) {
        setSelectedColor(res.data.colors[0]);
      }
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'Product not found.'
          : 'Failed to load product.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    
    // Refresh product data periodically to get latest stock status
    // BUT: Don't refresh if user is actively interacting (modal open, form inputs active)
    const refreshInterval = setInterval(() => {
      // Don't refresh if review modal is open
      if (showReviewForm) {
        console.log('⏸️ Skipping auto-refresh: Review modal is open');
        return;
      }
      
      // Don't refresh if user is actively typing in any input/textarea
      const activeElement = document.activeElement;
      const isUserTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );
      
      if (isUserTyping) {
        console.log('⏸️ Skipping auto-refresh: User is actively typing');
        return;
      }
      
      // Safe to refresh
      fetchProduct();
    }, 30000); // Refresh every 30 seconds (optimized for performance)
    
    // Also refresh when window regains focus, but only if no modals are open
    const handleFocus = () => {
      // Don't refresh if review modal is open
      if (showReviewForm) {
        console.log('⏸️ Skipping focus refresh: Review modal is open');
        return;
      }
      
      // Don't refresh if user is actively typing
      const activeElement = document.activeElement;
      const isUserTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );
      
      if (isUserTyping) {
        console.log('⏸️ Skipping focus refresh: User is actively typing');
        return;
      }
      
      fetchProduct();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id, fetchProduct, showReviewForm]);

  useEffect(() => {
    if (product && product.stock > 0) {
      setQuantity(prev => Math.min(prev, product.stock));
    }
    
    // Auto-select first size if available and no size is selected
    if (product && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
    
    // Auto-select first color if available and no color is selected
    if (product && product.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
  }, [product, selectedSize, selectedColor]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!product || isOutOfStock) {
      toast.error('Product is out of stock');
      return;
    }

    // Validate size selection if product has sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size before adding to cart');
      // Scroll to size selector
      document.querySelector('.form-label')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (hasStockValue && quantity > product.stock) {
      toast.error(`Only ${product.stock} unit${product.stock === 1 ? '' : 's'} available right now`);
      setQuantity(product.stock);
      return;
    }

    setAddingToCart(true);
    try {
      const result = await addToCart(product, quantity, selectedSize, selectedColor, rentalDuration);
      if (result.success) {
        toast.success('Item added to cart successfully!');
        // Refresh product data to get updated stock
        await fetchProduct();
        navigate('/cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(errorMessage);
      // Refresh product data even on error to get latest stock status
      await fetchProduct();
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    if (!product?._id) {
      toast.error('Product not available');
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

  const handleQuantityChange = (newQuantity) => {
    const numValue = parseInt(newQuantity, 10) || 1;
    if (numValue < 1) return;

    if (product && hasStockValue && product.stock > 0) {
      const maxAllowed = Math.min(numValue, product.stock);
      if (numValue > product.stock) {
        toast.info(`Only ${product.stock} unit${product.stock === 1 ? '' : 's'} available right now`);
      }
      setQuantity(maxAllowed);
    } else {
      setQuantity(numValue);
    }
  };

  const handleRentalDurationChange = (newDuration) => {
    const numValue = parseInt(newDuration) || 1;
    if (numValue >= 1) {
      setRentalDuration(numValue);
    }
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    return product.rentalPrice * quantity * rentalDuration;
  };

  const handleReviewUpdate = () => {
    // Refresh product data to update rating
    fetchProduct();
  };

  const fetchReviews = async () => {
    // This function is kept for compatibility but no longer needed
    // as ReviewList component handles its own data fetching
    return;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const hasStockValue = typeof product.stock === 'number';
  const stockCount = hasStockValue ? product.stock : 0;
  const stockStatus = product.stockStatus || (stockCount > 0 ? 'in_stock' : 'out_of_stock');
  const availabilityFlag = typeof product.availability === 'boolean' ? product.availability : stockCount > 0;
  const isOutOfStock = !availabilityFlag || stockStatus === 'out_of_stock' || (hasStockValue && stockCount <= 0);
  const availableStock = isOutOfStock ? 0 : hasStockValue ? Math.max(stockCount, 0) : null;
  const stockLabel = !hasStockValue
    ? availabilityFlag ? 'Available' : 'Out of Stock'
    : isOutOfStock
      ? 'Out of Stock'
      : `${availableStock} available`;

  return (
    <div className="container py-5 product-detail">
      <div className="row">
        <div className="col-md-6">
          <div 
            className="position-relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {product.images && product.images.length > 0 ? (
              <div className="product-image-container" style={{ height: '400px', borderRadius: '8px' }}>
                <img
                  src={product.images[currentImageIndex]}
                  alt={`${product.name} - ${currentImageIndex + 1} of ${product.images.length}`}
                  className="img-fluid"
                />
                
                {/* Image Indicators (Dots) - Only show if multiple images */}
                {hasMultipleImages && (
                  <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                    <div className="d-flex gap-2">
                      {product.images.map((_, index) => (
                        <div
                          key={index}
                          className={`rounded-circle ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                          style={{ 
                            width: '12px',
                            height: '12px',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center" style={{height: 400, borderRadius: '8px'}}>
                <span>No Image</span>
              </div>
            )}
          </div>


        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted mb-1">Category: {product.category}</p>
          {product.brand && <p className="mb-1">Brand: {product.brand}</p>}
          <p className="mb-1">Condition: {product.condition}</p>
          <p className="mb-1">
            Stock: {stockLabel}
          </p>
          
          {/* Rating */}
          <div className="mb-2">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!user) {
                    toast.error('Please login to write a review');
                    navigate('/login');
                    return;
                  }
                  console.log('Opening review modal from ProductDetail');
                  setShowReviewForm(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <FaStar className="text-warning me-1" />
                <span>{product.rating || 0}/5</span>
                <span className="text-muted ms-2">({product.reviews?.length || 0} reviews)</span>
              </button>
            </div>
          </div>

          <h4 className="my-3">
            ₹{product.rentalPrice}
            {product.originalPrice && product.originalPrice > product.rentalPrice && (
              <span className="text-muted ms-2" style={{ textDecoration: 'line-through', fontSize: '1rem' }}>
                ₹{product.originalPrice}
              </span>
            )}
            {product.discount > 0 && (
              <span className="badge bg-success ms-2">{product.discount}% OFF</span>
            )}
          </h4>

          {isOutOfStock && (
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <FaShoppingCart className="me-2" />
              <span>This item is currently out of stock. Please check back soon.</span>
            </div>
          )}
          
          <p>{product.description}</p>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="form-label mb-2">
                <strong style={{ fontSize: '1.1rem' }}>Select Size:</strong>
                {!selectedSize && <span className="text-danger ms-2" style={{ fontSize: '0.9rem' }}>* Required</span>}
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedSize(size)}
                    style={{ 
                      minWidth: '60px',
                      fontWeight: selectedSize === size ? 'bold' : 'normal',
                      border: selectedSize === size ? '2px solid #0d6efd' : '2px solid #dee2e6'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <label className="form-label mb-2">
                <strong style={{ fontSize: '1.1rem' }}>Select Color:</strong>
                {product.colors.length > 0 && !selectedColor && (
                  <span className="text-muted ms-2" style={{ fontSize: '0.9rem' }}>(Optional)</span>
                )}
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`btn ${selectedColor === color ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ 
                      minWidth: '80px',
                      fontWeight: selectedColor === color ? 'bold' : 'normal',
                      border: selectedColor === color ? '2px solid #0d6efd' : '2px solid #dee2e6'
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="mb-3">
            <label className="form-label">
              <strong>Quantity:</strong>
              {hasStockValue && !isOutOfStock && (
                <small className="text-muted ms-2">Max {availableStock}</small>
              )}
            </label>
            <div className="input-group" style={{ width: '150px' }}>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isOutOfStock}
              >
                -
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                min="1"
                max={hasStockValue && product.stock > 0 ? product.stock : undefined}
                disabled={isOutOfStock}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isOutOfStock || (hasStockValue && quantity >= product.stock)}
              >
                +
              </button>
            </div>
          </div>

          {/* Rental Duration */}
          <div className="mb-3">
            <label className="form-label"><strong>Rental Duration (days):</strong></label>
            <div className="input-group" style={{ width: '150px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => handleRentalDurationChange(rentalDuration - 1)}
                disabled={rentalDuration <= 1}
              >
                -
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={rentalDuration}
                onChange={(e) => handleRentalDurationChange(e.target.value)}
                min="1"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => handleRentalDurationChange(rentalDuration + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="mb-3 p-3 bg-light rounded">
            <h5>Total Price: ₹{calculateTotalPrice()}</h5>
            <small className="text-muted">
              (₹{product.rentalPrice} × {quantity} × {rentalDuration} days)
            </small>
          </div>

          {/* Add to Cart and Wishlist Buttons */}
          <div className="d-grid gap-2">
            <div className="row">
              <div className="col-9">
                <button
                  className={`btn btn-lg w-100 ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                  style={isOutOfStock ? { 
                    cursor: 'not-allowed',
                    backgroundColor: '#6c757d',
                    borderColor: '#6c757d',
                    opacity: 0.8
                  } : {}}
                >
                  {addingToCart ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Adding to Cart...
                    </>
                  ) : !isOutOfStock ? (
                    <>
                      <FaShoppingCart className="me-2" />
                      Add to Cart
                    </>
                  ) : (
                    <>
                      🚫 OUT OF STOCK
                    </>
                  )}
                </button>
              </div>
              <div className="col-3">
                <button
                  className={`btn btn-lg w-100 ${product?._id && isWishlisted(product._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  title={product?._id && isWishlisted(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  {wishlistLoading ? (
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                  ) : (
                    <FaHeart />
                  )}
                </button>
              </div>
            </div>
            
            {product?._id && isInCart(product._id, selectedSize, selectedColor) && (
              <div className="alert alert-info">
                <FaShoppingCart className="me-2" />
                This item is already in your cart!
              </div>
            )}
          </div>

          {/* Product Details */}
          {product.occasion && product.occasion.length > 0 && (
            <div className="mt-3">
              <strong>Occasion:</strong> {product.occasion.join(', ')}
            </div>
          )}
          
          {product.fabric && (
            <div className="mt-2">
              <strong>Fabric:</strong> {product.fabric}
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal - Using Portal to render outside component tree */}
      {showReviewForm && ReactDOM.createPortal(
        <div 
          id="product-detail-review-modal-overlay"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.85)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '50px',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            console.log('🖱️ ProductDetail modal backdrop clicked, target:', e.target.id);
            if (e.target.id === 'product-detail-review-modal-overlay') {
              console.log('✅ Closing ProductDetail modal from backdrop click');
              setShowReviewForm(false);
            }
          }}
        >
          {console.log('🎯 PRODUCT DETAIL REVIEW MODAL IS RENDERING!')}
          <div style={{ 
            maxWidth: '800px',
            width: '90%',
            margin: '0 auto',
            padding: '20px',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              <div style={{
                borderBottom: '1px solid #dee2e6',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#007bff',
                color: '#fff'
              }}>
                <h5 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                  Write a Review for {product.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    console.log('❌ ProductDetail modal close button clicked');
                    setShowReviewForm(false);
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {console.log('📝 About to render ReviewForm in ProductDetail with productId:', product?._id)}
                <ReviewForm
                  productId={product?._id}
                  onReviewSubmitted={(reviewData) => {
                    console.log('Review submitted from ProductDetail:', reviewData);
                    setShowReviewForm(false);
                    handleReviewUpdate();
                  }}
                  onCancel={() => {
                    console.log('Review form cancelled in ProductDetail');
                    setShowReviewForm(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reviews Section */}
      <div className="mt-5">
        <h4>Customer Reviews</h4>
        <ReviewList productId={product?._id} onReviewUpdate={handleReviewUpdate} />
      </div>
    </div>
  );
};

export default ProductDetail; 