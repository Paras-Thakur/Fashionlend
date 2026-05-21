import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FaStar, FaEdit, FaTrash, FaSpinner, FaComment, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from './ReviewForm';

const ReviewList = ({ productId, onReviewUpdate }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [editingReview, setEditingReview] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${productId}/reviews`, {
        params: {
          page: currentPage,
          limit: 5,
          sort: sortBy
        }
      });
      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, currentPage, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);



  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/api/products/${productId}/reviews/${reviewId}`);
        fetchReviews();
        toast.success('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (updatedReview) => {
    try {
      await api.put(`/api/products/${productId}/reviews/${editingReview._id}`, updatedReview);
      setShowEditForm(false);
      setEditingReview(null);
      fetchReviews();
      onReviewUpdate();
      toast.success('Review updated successfully');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const handleReviewSubmitted = (reviewData) => {
    console.log('📝 handleReviewSubmitted called - closing modal');
    setShowReviewForm(false);
    fetchReviews();
    if (onReviewUpdate) {
      onReviewUpdate();
    }
    toast.success('Review submitted successfully!');
  };

  // Check if current user has already reviewed
  useEffect(() => {
    if (user && reviews.length > 0) {
      const existingReview = reviews.find(review => review.user && review.user._id && user._id && review.user._id === user._id);
      setUserReview(existingReview || null);
    } else if (user && reviews.length === 0) {
      setUserReview(null);
    }
  }, [user, reviews]);

  // Debug: Monitor showReviewForm state
  useEffect(() => {
    console.log('showReviewForm state changed to:', showReviewForm);
  }, [showReviewForm]);

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        style={{
          color: star <= rating ? '#ffc107' : '#e4e5e9',
          fontSize: '12px'
        }}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <FaSpinner className="fa-spin" size={24} />
        <p className="mt-2">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <>
        <div className="text-center py-4">
          <p className="text-muted mb-3">No reviews yet. Be the first to review this product!</p>
          {user ? (
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('✏️ Write First Review clicked, setting showReviewForm to true');
                setShowReviewForm(true);
                console.log('State will update to true on next render');
              }}
            >
              <FaComment className="me-2" />
              Write the First Review
            </button>
          ) : (
            <p className="text-muted">Please login to write a review</p>
          )}
        </div>

        {/* Review Form Modal - Using Portal to render outside component tree */}
        {showReviewForm && ReactDOM.createPortal(
          <div 
            id="review-modal-overlay"
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
              console.log('🖱️ Modal backdrop clicked, target:', e.target.id);
              if (e.target.id === 'review-modal-overlay') {
                console.log('✅ Closing modal from backdrop click');
                setShowReviewForm(false);
              }
            }}
          >
            {console.log('🎯 PORTAL MODAL IS RENDERING!')}
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
                  <h5 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Write a Review</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      console.log('❌ Close button clicked');
                      setShowReviewForm(false);
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {console.log('📝 About to render ReviewForm with productId:', productId)}
                  <ReviewForm
                    productId={productId}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancel={() => setShowReviewForm(false)}
                    initialData={null}
                    isEditing={false}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <div className="review-list-container">
             {/* Sort Controls */}
       <div className="d-flex justify-content-between align-items-center mb-3 p-2" style={{ 
         backgroundColor: '#f8f9fa', 
         borderRadius: '6px',
         border: '1px solid #e9ecef'
       }}>
         <h6 className="mb-0" style={{ 
           fontSize: '16px', 
           fontWeight: '600',
           color: '#495057'
         }}>Customer Reviews ({reviews.length})</h6>
         <div className="d-flex gap-2 align-items-center">
           <select
             className="form-select form-select-sm"
             style={{ 
               width: 'auto', 
               fontSize: '12px', 
               padding: '-1px 8px',
               border: '1px solid #dee2e6',
               borderRadius: '4px',
               backgroundColor: '#fff',
               color: '#495057',
               cursor: 'pointer',
               outline: 'none',
               transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
             }}
             onMouseEnter={(e) => {
               e.target.style.borderColor = '#007bff';
               e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
             }}
             onMouseLeave={(e) => {
               e.target.style.borderColor = '#dee2e6';
               e.target.style.boxShadow = 'none';
             }}
             onFocus={(e) => {
               e.target.style.borderColor = '#007bff';
               e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
             }}
             onBlur={(e) => {
               e.target.style.borderColor = '#dee2e6';
               e.target.style.boxShadow = 'none';
             }}
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value)}
           >
             <option value="date">Most Recent</option>
             <option value="rating-high">Highest Rated</option>
             <option value="rating-low">Lowest Rated</option>
           </select>
           {user ? (
             !userReview ? (
               <button
                 className="btn btn-primary btn-sm"
                 style={{ 
                   fontSize: '12px', 
                   padding: '6px 12px',
                   borderRadius: '4px',
                   fontWeight: '500',
                   border: 'none',
                   transition: 'all 0.2s ease-in-out'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.transform = 'translateY(-1px)';
                   e.target.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.transform = 'translateY(0)';
                   e.target.style.boxShadow = 'none';
                 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('✏️ Write Review button clicked');
                  setShowReviewForm(true);
                  console.log('State will update to true on next render');
                }}
               >
                 <FaComment className="me-1" />
                 Write Review
               </button>
             ) : (
               <span className="text-success small" style={{ 
                 fontSize: '11px',
                 padding: '4px 8px',
                 backgroundColor: '#d4edda',
                 borderRadius: '4px',
                 border: '1px solid #c3e6cb',
                 fontWeight: '500'
               }}>
                 <FaComment className="me-1" />
                 Reviewed
               </span>
             )
           ) : (
             <span className="text-muted small" style={{ 
               fontSize: '11px',
               padding: '4px 8px',
               backgroundColor: '#f8f9fa',
               borderRadius: '4px',
               border: '1px solid #dee2e6',
               fontWeight: '500'
             }}>Login to review</span>
           )}
         </div>
       </div>

                           {/* Reviews */}
        <div className="reviews-container">
          {reviews.map((review) => (
            <div key={review._id} className="review-item border-bottom pb-2 mb-2">
              <div className="d-flex align-items-center">
                {/* Review Content */}
                <div className="flex-grow-1">
                 <div className="d-flex justify-content-between align-items-start mb-1">
                   <div className="d-flex align-items-center">
                     <div className="me-1">
                       {renderStars(review.rating)}
                     </div>
                     <span className="fw-bold me-1" style={{ fontSize: '13px' }}>
                       {review.user?.firstName} {review.user?.lastName}
                     </span>
                     <small className="text-muted" style={{ fontSize: '11px' }}>{formatDate(review.date)}</small>
                   </div>
                   
                   {/* Edit/Delete buttons for review owner */}
                   {user && review.user?._id === user._id && (
                     <div className="btn-group btn-group-sm">
                       <button
                         className="btn btn-outline-primary btn-sm"
                         style={{ padding: '1px 4px', fontSize: '10px' }}
                         onClick={() => handleEditReview(review)}
                         title="Edit Review"
                       >
                         <FaEdit />
                       </button>
                       <button
                         className="btn btn-outline-danger btn-sm"
                         style={{ padding: '1px 4px', fontSize: '10px' }}
                         onClick={() => handleDeleteReview(review._id)}
                         title="Delete Review"
                       >
                         <FaTrash />
                       </button>
                     </div>
                   )}
                 </div>

                 {/* Review Comment - Single Line */}
                 {review.comment && (
                   <p className="mb-1 text-truncate" style={{ maxWidth: '100%', fontSize: '12px', lineHeight: '1.2' }}>
                     {review.comment}
                   </p>
                 )}

                 {/* Review Images */}
                 {review.images && review.images.length > 0 && (
                   <div className="mb-1">
                     <div className="d-flex flex-wrap gap-1">
                       {review.images.map((image, index) => (
                         <img
                           key={index}
                           src={image}
                           alt={`Review ${index + 1}`}
                           className="img-thumbnail"
                           style={{ 
                             width: '30px', 
                             height: '30px', 
                             objectFit: 'cover', 
                             cursor: 'pointer',
                             transition: 'transform 0.2s ease'
                           }}
                           onClick={() => handleImageClick(image)}
                           onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                           onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                           title="Click to view full size"
                         />
                       ))}
                     </div>
                   </div>
                 )}

                 
               </div>
             </div>
           </div>
         ))}
       </div>

             {/* Pagination */}
       {totalPages > 1 && (
         <nav aria-label="Reviews pagination">
           <ul className="pagination pagination-sm justify-content-center">
             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
               <button
                 className="page-link"
                 style={{ fontSize: '12px', padding: '4px 8px' }}
                 onClick={() => setCurrentPage(currentPage - 1)}
                 disabled={currentPage === 1}
               >
                 Prev
               </button>
             </li>
             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
               <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                 <button
                   className="page-link"
                   style={{ fontSize: '12px', padding: '4px 8px' }}
                   onClick={() => setCurrentPage(page)}
                 >
                   {page}
                 </button>
               </li>
             ))}
             <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
               <button
                 className="page-link"
                 style={{ fontSize: '12px', padding: '4px 8px' }}
                 onClick={() => setCurrentPage(currentPage + 1)}
                 disabled={currentPage === totalPages}
               >
                 Next
               </button>
             </li>
           </ul>
         </nav>
       )}

      {/* Edit Review Modal */}
      {showEditForm && editingReview && (
        <div 
          className="modal fade show d-block" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditForm(false);
              setEditingReview(null);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ zIndex: 1055 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Review</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingReview(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <ReviewForm
                  productId={productId}
                  onReviewSubmitted={handleEditSubmit}
                  onCancel={() => {
                    setShowEditForm(false);
                    setEditingReview(null);
                  }}
                  initialData={editingReview}
                  isEditing={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal - Using Portal to render outside component tree */}
      {showReviewForm && ReactDOM.createPortal(
        <div 
          id="review-modal-overlay"
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
            console.log('🖱️ Modal backdrop clicked, target:', e.target.id);
            if (e.target.id === 'review-modal-overlay') {
              console.log('✅ Closing modal from backdrop click');
              setShowReviewForm(false);
            }
          }}
        >
          {console.log('🎯 PORTAL MODAL IS RENDERING!')}
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
                <h5 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Write a Review</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    console.log('❌ Close button clicked');
                    setShowReviewForm(false);
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {console.log('📝 About to render ReviewForm with productId:', productId)}
                <ReviewForm
                  productId={productId}
                  onReviewSubmitted={handleReviewSubmitted}
                  onCancel={() => setShowReviewForm(false)}
                  initialData={null}
                  isEditing={false}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div 
          className="modal fade show d-block" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.9)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10001
          }}
          onClick={closeImageModal}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl" style={{ zIndex: 10002 }}>
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 bg-transparent">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeImageModal}
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <img
                  src={selectedImage}
                  alt="Full size"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 