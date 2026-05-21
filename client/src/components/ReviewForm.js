import React, { useState } from 'react';
import { FaStar, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const ReviewForm = ({ productId, onReviewSubmitted, onCancel, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    comment: initialData?.comment || '',
    images: initialData?.images || []
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    if (formData.images.length + files.length > 5) {
      toast.error('Total images cannot exceed 5');
      return;
    }

    try {
      setUploadingImages(true);
      const formDataUpload = new FormData();
      files.forEach(file => {
        formDataUpload.append('images', file);
      });

      const response = await api.post('/api/upload/images', formDataUpload);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...response.data.images.map(img => img.imageUrl)]
      }));
      
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('ReviewForm: Submitting review for product:', productId);
    console.log('ReviewForm: Form data:', formData);
    
    if (!formData.rating) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        // For editing, call the callback directly with the form data
        console.log('ReviewForm: Editing mode, calling callback');
        onReviewSubmitted(formData);
      } else {
        // For new reviews, post to API
        console.log('ReviewForm: Submitting new review to API');
        const response = await api.post(`/api/products/${productId}/reviews`, formData);
        console.log('ReviewForm: API response:', response.data);
        toast.success('Review submitted successfully!');
        onReviewSubmitted(response.data);
        setFormData({ rating: 0, comment: '', images: [] });
      }
    } catch (error) {
      console.error('ReviewForm: Error submitting review:', error);
      console.error('ReviewForm: Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={`star ${star <= (hoveredStar || formData.rating) ? 'filled' : ''}`}
        onClick={() => handleRatingChange(star)}
        onMouseEnter={() => setHoveredStar(star)}
        onMouseLeave={() => setHoveredStar(0)}
        style={{
          cursor: 'pointer',
          fontSize: '24px',
          marginRight: '4px',
          color: star <= (hoveredStar || formData.rating) ? '#ffc107' : '#e4e5e9',
          transition: 'color 0.2s ease'
        }}
      />
    ));
  };

  return (
    <div className="review-form-container" style={{
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h5>{isEditing ? 'Edit Review' : 'Write a Review'}</h5>
      <form onSubmit={handleSubmit}>
        {/* Rating Section */}
        <div className="mb-3">
          <label className="form-label">Rating *</label>
          <div className="d-flex align-items-center">
            {renderStars()}
            <span className="ms-2 text-muted">
              {formData.rating ? `${formData.rating} out of 5` : 'Select rating'}
            </span>
          </div>
        </div>

        {/* Comment Section */}
        <div className="mb-3">
          <label htmlFor="comment" className="form-label">Review Comment *</label>
          <textarea
            className="form-control"
            id="comment"
            rows="4"
            value={formData.comment}
            onChange={handleCommentChange}
            placeholder="Share your experience with this product..."
            maxLength="1000"
            required
          />
          <div className="form-text">
            {formData.comment.length}/1000 characters
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mb-3">
          <label className="form-label">Add Photos (Optional)</label>
          <div className="d-flex align-items-center mb-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="form-control"
              style={{ maxWidth: '300px' }}
              disabled={uploadingImages}
            />
            {uploadingImages && (
              <FaSpinner className="fa-spin ms-2" />
            )}
          </div>
          <small className="form-text text-muted">
            You can upload up to 5 images. Maximum size: 5MB each.
          </small>
        </div>

        {/* Image Preview */}
        {formData.images.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Uploaded Images</label>
            <div className="d-flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="position-relative">
                  <img
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="img-thumbnail"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                    style={{ transform: 'translate(50%, -50%)' }}
                    onClick={() => removeImage(index)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !formData.rating || !formData.comment.trim()}
          >
            {submitting ? (
              <>
                <FaSpinner className="fa-spin me-2" />
                Submitting...
              </>
            ) : (
              isEditing ? 'Update Review' : 'Submit Review'
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 