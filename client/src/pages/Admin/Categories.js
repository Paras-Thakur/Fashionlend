import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    type: 'womens',
    section: 'more-collection',
    description: '',
    image: '',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/api/admin/categories/${editingId}`, formData);
        toast.success('Category updated successfully!');
        setEditingId(null);
      } else {
        await api.post('/api/admin/categories', formData);
        toast.success('Category added successfully!');
        setShowAddForm(false);
      }
      
      setFormData({
        name: '',
        displayName: '',
        type: 'womens',
        section: 'more-collection',
        description: '',
        image: '',
        isActive: true,
        sortOrder: 0
      });
      
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      type: category.type,
      section: category.section,
      description: category.description || '',
      image: category.image || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/api/admin/categories/${id}`);
        toast.success('Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      displayName: '',
      type: 'womens',
      section: 'more-collection',
      description: '',
      image: '',
      isActive: true,
      sortOrder: 0
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      womens: 'primary',
      mens: 'success',
      traditional: 'warning',
      unisex: 'info'
    };
    return colors[type] || 'secondary';
  };

  const getSectionColor = (section) => {
    const colors = {
      main: 'primary',
      'more-collection': 'success',
      traditional: 'warning'
    };
    return colors[section] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h3">Category Management</h1>
          <p className="text-muted">Manage product categories from homepage collections</p>
        </div>
        <div className="col-md-6 text-end">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm || editingId}
          >
            <FaPlus className="me-2" />
            Add New Category
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., sherwani"
                  />
                  <small className="text-muted">Lowercase, no spaces (used in URLs)</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Display Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Sherwani"
                  />
                  <small className="text-muted">Name shown to users</small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-select"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="womens">Women's Collection</option>
                    <option value="mens">Men's Collection</option>
                    <option value="traditional">Traditional</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Section *</label>
                  <select
                    className="form-select"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                  >
                    <option value="main">Main Collection</option>
                    <option value="more-collection">More Collection</option>
                    <option value="traditional">Traditional</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Brief description of the category"
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Sort Order</label>
                  <input
                    type="number"
                    className="form-control"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    Active Category
                  </label>
                </div>
              </div>

              <div className="text-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={cancelEdit}
                >
                  <FaTimes className="me-2" />
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaSave className="me-2" />
                  {editingId ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">All Categories ({categories.length})</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Category Name</th>
                  <th>Type</th>
                  <th>Section</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Sort Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <strong>{category.displayName}</strong>
                    </td>
                    <td>
                      <code>{category.name}</code>
                    </td>
                    <td>
                      <span className={`badge bg-${getTypeColor(category.type)}`}>
                        {category.type.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${getSectionColor(category.section)}`}>
                        {category.section.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {category.description ? (
                        <span title={category.description}>
                          {category.description.length > 50 
                            ? `${category.description.substring(0, 50)}...` 
                            : category.description}
                        </span>
                      ) : (
                        <span className="text-muted">No description</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge bg-${category.isActive ? 'success' : 'danger'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{category.sortOrder}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(category)}
                          disabled={editingId || showAddForm}
                          title="Edit Category"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(category._id)}
                          disabled={editingId || showAddForm}
                          title="Delete Category"
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
        </div>
      </div>
    </div>
  );
};

export default Categories;
