import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  // Get all products with filters
  const getProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/api/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Get products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get featured products
  const getFeaturedProducts = useCallback(async () => {
    try {
      const res = await api.get('/api/products/featured');
      setFeaturedProducts(res.data);
    } catch (error) {
      console.error('Get featured products error:', error);
    }
  }, []);

  // Get categories
  const getCategories = useCallback(async () => {
    try {
      const res = await api.get('/api/products/categories');
      setCategories(res.data.categories || []);
      setCategoryDetails(res.data.categoryDetails || []);
    } catch (error) {
      console.error('Get categories error:', error);
    }
  }, []);

  // Get categories by type
  const getCategoriesByType = useCallback(async (type) => {
    try {
      const res = await api.get(`/api/products/categories/${type}`);
      return res.data.categories || [];
    } catch (error) {
      console.error('Get categories by type error:', error);
      return [];
    }
  }, []);

  // Get single product
  const getProduct = useCallback(async (id) => {
    try {
      const res = await api.get(`/api/products/${id}`);
      return res.data;
    } catch (error) {
      console.error('Get product error:', error);
      toast.error('Failed to load product details');
      return null;
    }
  }, []);

  // Get products by category
  const getProductsByCategory = useCallback(async (category, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/api/products/category/${category}?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Get category products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get products by state
  const getProductsByState = useCallback(async (state, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/api/products/state/${state}?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Get state products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add review to product
  const addReview = useCallback(async (productId, reviewData) => {
    try {
      const res = await api.post(`/api/products/${productId}/reviews`, reviewData);
      toast.success('Review added successfully!');
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add review';
      toast.error(message);
      return null;
    }
  }, []);

  // Search products
  const searchProducts = useCallback(async (searchTerm, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...filters, search: searchTerm });
      const res = await api.get(`/api/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Search products error:', error);
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    getFeaturedProducts();
    getCategories();
  }, []);

  const value = useMemo(() => ({
    products,
    featuredProducts,
    categories,
    categoryDetails,
    loading,
    pagination,
    getProducts,
    getFeaturedProducts,
    getCategories,
    getCategoriesByType,
    getProduct,
    getProductsByCategory,
    getProductsByState,
    addReview,
    searchProducts
  }), [
    products,
    featuredProducts,
    categories,
    categoryDetails,
    loading,
    pagination,
    getProducts,
    getFeaturedProducts,
    getCategories,
    getCategoriesByType,
    getProduct,
    getProductsByCategory,
    getProductsByState,
    addReview,
    searchProducts
  ]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 