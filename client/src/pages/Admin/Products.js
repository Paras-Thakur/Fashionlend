import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { useProducts } from '../../contexts/ProductContext';

const AdminProducts = () => {
  const { categories, getCategories } = useProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    getCategories();
  }, [currentPage, searchTerm, selectedCategory, getCategories]);

  // Fallback categories in case API fails
  const fallbackCategories = [
    'lehenga', 'anarkali', 'gown', 'sherwani', 'indo-western', 'tuxedo', 'bridal',
    // Men's collection categories
    'shirts', 'blazers', 'jackets', 'coats', 'pants', 'sweaters',
    // Women's collection categories
    'weightless-lehengas', 'kitty-special', 'festive-special', 'kurtis', 'haldi-special'
  ];

  // Use categories from context or fallback
  const availableCategories = categories && categories.length > 0 ? categories : fallbackCategories;

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await api.get(`/api/admin/products?${params}`);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/admin/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const toggleAvailability = async (productId, currentStatus) => {
    try {
      await api.patch(`/api/admin/products/${productId}`, {
        availability: !currentStatus
      });
      toast.success('Product availability updated');
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };



  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h3">Manage Products</h1>
        </div>
        <div className="col-md-6 text-end">
          <Link to="/admin/products/add" className="btn btn-primary">
            <FaPlus className="me-2" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <br />
                      <small className="text-muted">{product.brand}</small>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {product.category}
                      </span>
                    </td>
                    <td>₹{product.rentalPrice}</td>
                    <td>
                      <span className={`badge bg-${product.stock > 0 ? 'success' : 'danger'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${product.availability ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => toggleAvailability(product._id, product.availability)}
                      >
                        {product.availability ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Link
                          to={`/product/${product._id}`}
                          className="btn btn-sm btn-outline-primary"
                          title="View"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="btn btn-sm btn-outline-warning"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(product._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <li
                      key={page}
                      className={`page-item ${page === currentPage ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  );
                })}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts; 