import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';

const Products = () => {
  const { category, state } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, pagination, getProducts, getProductsByCategory, getProductsByState, categories } = useProducts();
  
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    size: '',
    color: '',
    occasion: '',
    minRating: '',
    sort: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const search = searchParams.get('search');
    const currentFilters = {
      page: searchParams.get('page') || '1',
      search: search || '',
      ...filters
    };

    if (category) {
      getProductsByCategory(category, currentFilters);
    } else if (state) {
      getProductsByState(state, currentFilters);
    } else {
      getProducts(currentFilters);
    }
  }, [category, state, filters, searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      occasion: '',
      minRating: '',
      sort: 'newest'
    });
    setSearchParams({ page: '1' });
  };

  const getCategoryTitle = () => {
    if (!category && !state) return 'All Products';
    if (state) return `${decodeURIComponent(state)} Traditional Wear`;
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h2">{getCategoryTitle()}</h1>
          <p className="text-muted">
            {pagination.totalProducts || 0} products found
          </p>
        </div>
        <div className="col-md-6 text-md-end">
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-2" />
            Filters
          </button>
          <div className="btn-group">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <FaSort className="me-2" />
              Sort
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleFilterChange('sort', 'newest')}
                >
                  Newest First
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleFilterChange('sort', 'price-low')}
                >
                  Price: Low to High
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleFilterChange('sort', 'price-high')}
                >
                  Price: High to Low
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleFilterChange('sort', 'rating')}
                >
                  Highest Rated
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-2 mb-3">
                    <label className="form-label">Price Range</label>
                    <div className="row">
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2 mb-3">
                    <label className="form-label">Size</label>
                    <select
                      className="form-select"
                      value={filters.size}
                      onChange={(e) => handleFilterChange('size', e.target.value)}
                    >
                      <option value="">All Sizes</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="Free Size">Free Size</option>
                    </select>
                  </div>

                  <div className="col-md-2 mb-3">
                    <label className="form-label">Color</label>
                    <select
                      className="form-select"
                      value={filters.color}
                      onChange={(e) => handleFilterChange('color', e.target.value)}
                    >
                      <option value="">All Colors</option>
                      <option value="Red">Red</option>
                      <option value="Blue">Blue</option>
                      <option value="Green">Green</option>
                      <option value="Black">Black</option>
                      <option value="White">White</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                    </select>
                  </div>

                  <div className="col-md-2 mb-3">
                    <label className="form-label">Occasion</label>
                    <select
                      className="form-select"
                      value={filters.occasion}
                      onChange={(e) => handleFilterChange('occasion', e.target.value)}
                    >
                      <option value="">All Occasions</option>
                      <option value="wedding">Wedding</option>
                      <option value="party">Party</option>
                      <option value="festival">Festival</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>

                  <div className="col-md-2 mb-3">
                    <label className="form-label">Minimum Rating</label>
                    <select
                      className="form-select"
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    >
                      <option value="">All Ratings</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4.0">4.0+ Stars</option>
                      <option value="3.5">3.5+ Stars</option>
                      <option value="3.0">3.0+ Stars</option>
                      <option value="2.5">2.5+ Stars</option>
                      <option value="2.0">2.0+ Stars</option>
                    </select>
                  </div>

                  <div className="col-md-2 mb-3 d-flex align-items-end">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={clearFilters}
                      style={{ 
                        width: '100%',
                        backgroundColor: '#0d6efd',
                        borderColor: '#6c757d',
                        color: '#FFFFFF'
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id || Math.random()} product={product}>
                <Link to={`/products/${product._id}`} className="btn btn-outline-primary">
                  View Details
                </Link>
              </ProductCard>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="mt-5">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <li
                      key={page}
                      className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  );
                })}

                <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <h4>No products found</h4>
          <p className="text-muted">Try adjusting your filters or search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Products; 