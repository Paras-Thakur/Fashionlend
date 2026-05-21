import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { FaHeart, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlist: wishlistItems, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const [removingItem, setRemovingItem] = useState(null);

  // Filter out items with null or missing products
  const validWishlistItems = wishlistItems.filter(
    (item) => item && item.product && item.product._id
  );

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItem(productId);
    try {
      await removeFromWishlist(productId);
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await clearWishlist();
        toast.success('Wishlist cleared successfully');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast.error('Failed to clear wishlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 wishlist-page">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h2">
            <FaHeart className="me-2 text-danger" />
            My Wishlist
          </h1>
          <p className="text-muted">
            {validWishlistItems.length} item{validWishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>
        <div className="col-md-6 text-md-end">
          <Link to="/products" className="btn btn-outline-primary me-2">
            Continue Shopping
          </Link>
          {validWishlistItems.length > 0 && (
            <button 
              onClick={handleClearWishlist}
              className="btn btn-outline-danger"
              disabled={removingItem}
            >
              <FaTrash className="me-2" />
              Clear Wishlist
            </button>
          )}
        </div>
      </div>

      {validWishlistItems.length === 0 ? (
        <div className="text-center py-5">
          <FaHeart size={64} className="text-muted mb-3" />
          <h3>Your wishlist is empty</h3>
          <p className="text-muted mb-4">
            Start adding items to your wishlist to save them for later.
          </p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {validWishlistItems.map((wishlistItem) => (
              <ProductCard key={wishlistItem.product._id} product={wishlistItem.product} hideWishlistButtons={true}>
                <div className="d-grid gap-2">
                  <Link to={`/products/${wishlistItem.product._id}`} className="btn btn-outline-primary">
                    View Details
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveFromWishlist(wishlistItem.product._id)}
                    disabled={removingItem === wishlistItem.product._id}
                    style={{ height: '38px', fontSize: '14px', padding: '6px 12px' }}
                  >
                    {removingItem === wishlistItem.product._id ? (
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    ) : (
                      <FaTrash className="me-2" />
                    )}
                    Remove
                  </button>
                </div>
              </ProductCard>
            ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
