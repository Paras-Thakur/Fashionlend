import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { useProducts } from '../../contexts/ProductContext';

const AddProduct = () => {
  const navigate = useNavigate();
  const { categories, categoryDetails, getCategories } = useProducts();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    rentalPrice: '',
    originalPrice: '',
    discount: 0,
    sizes: [],
    colors: [],
    fabric: '',
    occasion: [],
    state: '',
    region: '',
    brand: '',
    condition: 'excellent',
    stock: 1,
    tags: '',
    featured: false
  });

  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  // Load categories when component mounts
  useEffect(() => {
    getCategories();
    
    // Direct API call as backup
    const loadCategoriesDirectly = async () => {
      try {
        const response = await api.get('/api/products/categories');
        console.log('Direct API response:', response.data);
        console.log('Direct categories:', response.data.categories);
      } catch (error) {
        console.error('Direct API call failed:', error);
      }
    };
    
    loadCategoriesDirectly();
  }, [getCategories]);

  // Debug: Log categories when they change
  useEffect(() => {
    console.log('Categories loaded:', categories);
    console.log('Available categories:', availableCategories);
    console.log('Categories length:', categories ? categories.length : 0);
  }, [categories, availableCategories]);

  // Fallback categories in case API fails
  const fallbackCategories = [
    'lehenga', 'anarkali', 'gown', 'sherwani', 'indo-western', 'tuxedo', 'bridal',
    // Men's collection categories
    'shirts', 'blazers', 'jackets', 'coats', 'pants', 'sweaters',
    // Women's collection categories
    'weightless-lehengas', 'kitty-special', 'festive-special', 'kurtis', 'haldi-special',
    // Additional categories
    'saree', 'salwar-kameez', 'dhoti-kurta', 'kurta-pyjama', 'palazzo-suits', 
    'crop-top-lehenga', 'dress-material', 'ethnic-sets'
  ];

  // Use categories from context or fallback
  const availableCategories = categories && categories.length > 0 ? categories : fallbackCategories;
  
  // Organize categories by type for better dropdown
  const organizeCategoriesByType = () => {
    if (categoryDetails && categoryDetails.length > 0) {
      const organized = {
        'Women\'s Collection': [],
        'Men\'s Collection': [],
        'Traditional': [],
        'Other': []
      };
      
      categoryDetails.forEach(cat => {
        const displayName = cat.displayName || cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
        const categoryOption = { value: cat.name, label: displayName, description: cat.description };
        
        if (cat.type === 'womens') {
          organized['Women\'s Collection'].push(categoryOption);
        } else if (cat.type === 'mens') {
          organized['Men\'s Collection'].push(categoryOption);
        } else if (cat.type === 'traditional') {
          organized['Traditional'].push(categoryOption);
        } else {
          organized['Other'].push(categoryOption);
        }
      });
      
      return organized;
    }
    
    // Fallback to simple list if no category details
    return {
      'All Categories': availableCategories.map(cat => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1)
      }))
    };
  };
  
  const organizedCategories = organizeCategoriesByType();

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const occasions = ['wedding', 'party', 'festival', 'casual', 'formal'];
  const conditions = ['excellent', 'good', 'fair'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setImageUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.description || !formData.rentalPrice || !formData.state) {
        toast.error('Please fill in all required fields: Name, Category, Description, Rental Price, and State');
        setLoading(false);
        return;
      }

      // Upload images to Cloudinary first
      let uploadedImages = [];
      if (images.length > 0) {
        setUploadingImages(true);
        try {
          const formDataImages = new FormData();
          images.forEach((image) => {
            formDataImages.append('images', image);
          });

          const uploadResponse = await api.post('/api/upload/images', formDataImages, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadResponse.data.success) {
            uploadedImages = uploadResponse.data.images.map(img => img.imageUrl);
            toast.success(`${uploadedImages.length} image(s) uploaded successfully!`);
          } else {
            throw new Error('Failed to upload images');
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast.error('Failed to upload images. Please try again.');
          setLoading(false);
          setUploadingImages(false);
          return;
        } finally {
          setUploadingImages(false);
        }
      } else {
        // Provide a default image if none is uploaded
        uploadedImages = ['https://via.placeholder.com/400x600?text=Product+Image'];
      }

      const productData = {
        ...formData,
        images: uploadedImages,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        // Ensure originalPrice is set if not provided
        originalPrice: formData.originalPrice || formData.rentalPrice,
        // Convert numeric fields
        rentalPrice: parseFloat(formData.rentalPrice),
        originalPrice: parseFloat(formData.originalPrice || formData.rentalPrice),
        discount: parseFloat(formData.discount || 0),
        stock: parseInt(formData.stock || 1)
      };

      await api.post('/api/admin/products', productData);
      toast.success('Product added successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add product. Please check all required fields.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h1 className="h3">Add New Product</h1>
        </div>
        <div className="col-md-6 text-end">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/admin/products')}
          >
            <FaTimes className="me-2" />
            Cancel
          </button>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Basic Information */}
              <div className="col-md-8">
                <h5 className="mb-3">Basic Information</h5>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {Object.entries(organizedCategories).map(([groupName, groupCategories]) => (
                        <optgroup key={groupName} label={groupName}>
                          {groupCategories.map(category => (
                            <option key={category.value} value={category.value} title={category.description}>
                              {category.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <small className="text-muted">
                      Categories are organized by collection type for easier selection
                    </small>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Sub Category</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      className="form-control"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                  ></textarea>
                </div>

                {/* Pricing */}
                <h5 className="mb-3 mt-4">Pricing</h5>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Rental Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="rentalPrice"
                      value={formData.rentalPrice}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Original Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Discount (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <h5 className="mb-3 mt-4">Product Details</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fabric</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fabric"
                      value={formData.fabric}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Condition</label>
                    <select
                      className="form-select"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                    >
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>
                          {condition.charAt(0).toUpperCase() + condition.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">State *</label>
                    <select
                      className="form-select"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Region</label>
                    <input
                      type="text"
                      className="form-control"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., bridal, designer, traditional"
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">
                      Featured Product
                    </label>
                  </div>
                </div>
              </div>

              {/* Options and Images */}
              <div className="col-md-4">
                <h5 className="mb-3">Options & Images</h5>

                {/* Sizes */}
                <div className="mb-3">
                  <label className="form-label">Available Sizes</label>
                  <div className="row">
                    {sizes.map(size => (
                      <div key={size} className="col-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.sizes.includes(size)}
                            onChange={(e) => handleArrayChange('sizes', size, e.target.checked)}
                          />
                          <label className="form-check-label">
                            {size}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-3">
                  <label className="form-label">Colors</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Red, Blue, Green"
                    value={formData.colors.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      colors: e.target.value.split(',').map(color => color.trim()).filter(color => color)
                    }))}
                  />
                </div>

                {/* Occasions */}
                <div className="mb-3">
                  <label className="form-label">Occasions</label>
                  {occasions.map(occasion => (
                    <div key={occasion} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.occasion.includes(occasion)}
                        onChange={(e) => handleArrayChange('occasion', occasion, e.target.checked)}
                      />
                      <label className="form-check-label">
                        {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Stock */}
                <div className="mb-3">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                {/* Images */}
                <div className="mb-3">
                  <label className="form-label">Product Images</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImages}
                  />
                  <small className="text-muted">Select multiple images (Max 10, 5MB each)</small>
                  
                  {uploadingImages && (
                    <div className="mt-2">
                      <div className="progress">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" 
                             style={{ width: '100%' }}>
                          Uploading images...
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Preview */}
                {imageUrls.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Image Preview ({imageUrls.length} selected)</label>
                    <div className="row">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="col-6 mb-2">
                          <div className="position-relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="img-fluid rounded"
                              style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ margin: '2px' }}
                              onClick={() => {
                                const newImages = images.filter((_, i) => i !== index);
                                const newUrls = imageUrls.filter((_, i) => i !== index);
                                setImages(newImages);
                                setImageUrls(newUrls);
                              }}
                              disabled={uploadingImages}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-4" />

            <div className="text-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || uploadingImages}
              >
                {loading || uploadingImages ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    {uploadingImages ? 'Uploading Images...' : 'Adding Product...'}
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct; 