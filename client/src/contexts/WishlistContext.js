import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      loadWishlist();
      loadWishlistCount();
    } else {
      setWishlist([]);
      setWishlistCount(0);
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading wishlist...');
      }
      const response = await api.get('/api/wishlist');
      if (process.env.NODE_ENV === 'development') {
        console.log('Wishlist response:', response.data);
      }
      setWishlist(response.data.wishlist || []);
      if (process.env.NODE_ENV === 'development') {
        console.log('Wishlist loaded, count:', response.data.wishlist?.length || 0);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlistCount = async () => {
    try {
      const response = await api.get('/api/wishlist/count');
      setWishlistCount(response.data.count || 0);
    } catch (error) {
      console.error('Error loading wishlist count:', error);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return { success: false, message: 'Please login first' };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Adding product ${productId} to wishlist for user ${user?._id}`);
    }

    try {
      const response = await api.post(`/api/wishlist/add/${productId}`);
      if (process.env.NODE_ENV === 'development') {
        console.log('Add to wishlist response:', response.data);
      }
      
      // Update the wishlist state with the complete wishlist from backend
      if (response.data.wishlist) {
        setWishlist(response.data.wishlist);
        if (process.env.NODE_ENV === 'development') {
          console.log('Updated wishlist state with', response.data.wishlist.length, 'products');
        }
      }
      
      setWishlistCount(response.data.count);
      
      toast.success('Product added to wishlist!');
      return { success: true };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(`/api/wishlist/remove/${productId}`);
      
      // Update the wishlist state with the complete wishlist from backend
      if (response.data.wishlist) {
        setWishlist(response.data.wishlist);
        if (process.env.NODE_ENV === 'development') {
          console.log('Updated wishlist state after removal with', response.data.wishlist.length, 'products');
        }
      }
      
      setWishlistCount(response.data.count);
      
      toast.success('Product removed from wishlist!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
      return { success: false, message };
    }
  };

  const toggleWishlist = async (productId) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Toggling wishlist for product ${productId}`);
      console.log('Current wishlist:', wishlist);
    }
    
    const isWishlisted = wishlist.some(item => {
      // Add comprehensive null checks
      if (!item || !item.product) return false;
      if (!item.product._id) return false;
      return item.product._id.toString() === productId.toString();
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(`Product ${productId} is wishlisted:`, isWishlisted);
    }
    
    if (isWishlisted) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const isWishlisted = (productId) => {
    if (!productId) return false;
    return wishlist.some(item => {
      // Add comprehensive null checks
      if (!item || !item.product) return false;
      if (!item.product._id) return false;
      return item.product._id.toString() === productId.toString();
    });
  };

  const clearWishlist = async () => {
    try {
      const response = await api.delete('/api/wishlist/clear');
      
      // Update the wishlist state with the response from backend
      if (response.data.wishlist) {
        setWishlist(response.data.wishlist);
        if (process.env.NODE_ENV === 'development') {
          console.log('Wishlist cleared, updated state with', response.data.wishlist.length, 'products');
        }
      }
      
      setWishlistCount(response.data.count);
      toast.success('Wishlist cleared!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear wishlist';
      toast.error(message);
      return { success: false, message };
    }
  };

  const refreshWishlist = () => {
    loadWishlist();
    loadWishlistCount();
  };

  const value = {
    wishlist,
    wishlistCount,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
    clearWishlist,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 