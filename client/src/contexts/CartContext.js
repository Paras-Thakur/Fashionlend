import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from server when user is authenticated
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await api.get('/api/cart');
      setCartItems(res.data.items || []);
    } catch (error) {
      console.error('Load cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, size, color, rentalDuration) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    if (!product || !product._id) {
      toast.error('Invalid product data');
      return { success: false };
    }

    try {
      const cartItem = {
        productId: product._id,
        quantity,
        size,
        color,
        rentalDuration,
        rentalPrice: product.rentalPrice,
        productName: product.name,
        productImage: product.images?.[0]
      };

      const res = await api.post('/api/cart/add', cartItem);
      setCartItems(res.data.cart);
      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateCartItem = async (productId, updates) => {
    if (!user) return { success: false };

    try {
      const res = await api.put(`/api/cart/update/${productId}`, updates);
      setCartItems(res.data.cart);
      toast.success('Cart updated!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return { success: false };

    try {
      const res = await api.delete(`/api/cart/remove/${productId}`);
      setCartItems(res.data.cart);
      toast.success('Item removed from cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      return { success: false, message };
    }
  };

  const clearCart = async () => {
    if (!user) return { success: false };

    try {
      const res = await api.delete('/api/cart/clear');
      setCartItems(res.data.cart);
      toast.success('Cart cleared!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return { success: false, message };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId, size, color) => {
    if (!productId) return false;
    return cartItems.some(item => {
      // Add comprehensive null checks
      if (!item) return false;
      const itemProductId = item.productId || (item.product && item.product._id);
      if (!itemProductId) return false;
      return itemProductId.toString() === productId.toString() && 
             item.size === size && 
             item.color === color;
    });
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 