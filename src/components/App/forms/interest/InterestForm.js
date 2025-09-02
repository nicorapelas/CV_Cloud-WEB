import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as InterestContext } from '../../../../context/InterestContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil } from 'lucide-react';
import './InterestForm.css';

const InterestForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);
  const {
    state: { interests, loading: contextLoading, error },
    fetchInterests,
    createInterest,
    editInterest,
    deleteInterest,
    clearInterestErrors,
  } = useContext(InterestContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    interest: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // Start with form hidden

  // Ref to track last refresh to prevent multiple rapid refreshes
  const lastRefreshTimestamp = useRef(null);

  // Scroll to top when component mounts
  useEffect(() => {
    // Cross-browser compatible scroll to top
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        // Modern browsers with smooth scrolling support
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback for older browsers or Firefox issues
        window.scrollTo(0, 0);
      }
    };

    // Small delay to ensure component is fully rendered
    setTimeout(scrollToTop, 100);
  }, []);

  // Update form data when interests from context changes
  useEffect(() => {
    if (interests && interests.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        interest: '',
      });
      setEditingId(null);
    }
  }, [interests]);

  // Update form visibility when interests changes
  useEffect(() => {
    console.log('interests', interests);

    // Show form when there are no interests, hide when there are interests and not editing
    if (!interests || interests.length === 0) {
      setShowForm(true);
    } else if (interests.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [interests, editingId]); // Dependency on interests and editingId

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'interest') {
      console.log('🔄 Interest update received:', lastUpdate);

      // Prevent multiple rapid refreshes (within 2 seconds)
      const now = Date.now();
      if (
        lastRefreshTimestamp.current &&
        now - lastRefreshTimestamp.current < 2000
      ) {
        console.log('🔄 Skipping refresh - too soon since last refresh');
        return;
      }

      setIsRefreshing(true);
      lastRefreshTimestamp.current = now;

      // Fetch updated data with a small delay to ensure server has processed the update
      setTimeout(() => {
        fetchInterests().finally(() => {
          setIsRefreshing(false);
        });
      }, 500);
    }
  }, [lastUpdate, fetchInterests]);

  // Fetch interests on user change
  useEffect(() => {
    if (user) {
      console.log('🔄 Setting up interests for user:', user.id);

      // Fetch interests data
      fetchInterests();
    }
  }, [user, fetchInterests]);

  // Check for recent updates and refresh if needed
  useEffect(() => {
    if (user && hasRecentUpdate('interest', 2) && !isRefreshing) {
      // Check last 2 minutes
      console.log(
        '🔄 Recent update detected, checking if refresh is needed...'
      );

      // Only refresh if we don't have current data or if it's been more than 5 seconds since last refresh
      const now = Date.now();
      const shouldRefresh =
        !interests ||
        interests.length === 0 ||
        !lastRefreshTimestamp.current ||
        now - lastRefreshTimestamp.current > 5000;

      if (shouldRefresh) {
        console.log('🔄 Refreshing data due to recent update...');
        setIsRefreshing(true);
        lastRefreshTimestamp.current = now;
        fetchInterests().finally(() => {
          setIsRefreshing(false);
        });
      } else {
        console.log('🔄 Skipping refresh - data is current');
      }
    }
  }, [user, hasRecentUpdate, interests, isRefreshing, fetchInterests]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.interest.trim()) {
      newErrors.interest = 'Interest is required';
    } else if (formData.interest.length > 100) {
      newErrors.interest = 'Interest must be 100 characters or less';
    }

    // Check for duplicate interests
    if (interests && interests.length > 0) {
      const duplicate = interests.find(
        interest =>
          interest.interest.toLowerCase() === formData.interest.toLowerCase() &&
          interest._id !== editingId
      );
      if (duplicate) {
        newErrors.interest = 'This interest already exists';
      }
    }

    setErrors(newErrors);

    // If there are errors, scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        // Cross-browser compatible scroll to error field
        const scrollToError = () => {
          if ('scrollBehavior' in document.documentElement.style) {
            errorElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          } else {
            // Fallback for older browsers or Firefox issues
            const elementTop = errorElement.offsetTop - 100; // 100px offset from top
            window.scrollTo(0, elementTop);
          }
        };
        setTimeout(scrollToError, 100);
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        await editInterest({ id: editingId, interest: formData.interest });
        setSuccessMessage('Interest updated successfully!');
        setEditingId(null);
      } else {
        // For creating, we need to send an array with ALL interests (existing + new)
        const existingInterests = interests
          ? interests.map(interest => ({ interest: interest.interest }))
          : [];
        const newInterestArray = [
          ...existingInterests,
          { interest: formData.interest },
        ];
        console.log('Sending interest array:', newInterestArray); // Debug log
        await createInterest(newInterestArray);
        setSuccessMessage('Interest added successfully!');
      }

      // Clear form after successful submission
      setFormData({
        interest: '',
      });

      // Clear errors
      clearInterestErrors();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Hide form after successful submission if there are interests
      if (interests && interests.length > 0 && !editingId) {
        setTimeout(() => {
          setShowForm(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting interest:', error);
    }
  };

  const handleEdit = interest => {
    setFormData({
      interest: interest.interest || '',
    });
    setEditingId(interest._id);
    setShowForm(true); // Show form when editing

    // Smooth scroll to the very top of the page
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    };
    setTimeout(scrollToTop, 100);
  };

  const handleShowForm = () => {
    setShowForm(true);
    setFormData({
      interest: '',
    });
    setErrors({});
    setSuccessMessage('');

    // Smooth scroll to the very top of the page
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    };
    setTimeout(scrollToTop, 100);
  };

  const handleHideForm = () => {
    setShowForm(false);
    setFormData({
      interest: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setFormData({
      interest: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are interests
    if (interests && interests.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleDeleteClick = interestId => {
    setDeletingId(interestId);
  };

  const confirmDelete = async interestId => {
    try {
      await deleteInterest(interestId);
      setSuccessMessage('Interest deleted successfully!');

      // Clear form if we were editing the deleted entry
      if (editingId === interestId) {
        setFormData({
          interest: '',
        });
        setEditingId(null);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting interest:', error);
      setErrors({ submit: 'Failed to delete interest. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="interest-form">
      <div className="interest-form-container" ref={formTopRef}>
        <div className="interest-form-header">
          <div className="interest-form-header-icon">🎯</div>
          <div className="interest-form-header-content">
            <h2>Interests</h2>
            <p>Add your personal interests and hobbies</p>
          </div>
        </div>

        {successMessage && (
          <div className="interest-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="interest-form-error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Show "Add Interest" button when there are interests and form is hidden */}
        {interests && interests.length > 0 && !showForm && !editingId && (
          <div className="interest-add-section">
            <button
              type="button"
              className="interest-add-button"
              onClick={handleShowForm}
            >
              Add Interest
            </button>
          </div>
        )}

        {/* Show form when there are no interests, or when explicitly shown, or when editing */}
        {(!interests || interests.length === 0 || showForm || editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`interest-form-element ${showForm ? 'interest-form-slide-down' : ''}`}
          >
            <div className="interest-form-section">
              <div className="interest-form-field">
                <label htmlFor="interest" className="interest-form-label">
                  Interest <span className="interest-required">*</span>
                </label>
                <input
                  type="text"
                  id="interest"
                  name="interest"
                  value={formData.interest}
                  onChange={handleInputChange}
                  className={`interest-form-input ${errors.interest ? 'interest-form-error' : ''}`}
                  placeholder="Enter an interest or hobby (e.g., Reading, Photography, Travel)"
                  maxLength={100}
                />
                {errors.interest && (
                  <div className="interest-form-error-message">
                    {errors.interest}
                  </div>
                )}
                <div className="interest-form-char-count">
                  {formData.interest.length}/100
                </div>
              </div>
            </div>

            {successMessage && (
              <div style={{ paddingTop: '20px', display: 'block' }}>
                <div className="interest-form-success">{successMessage}</div>
              </div>
            )}
            {error && (
              <div className="interest-form-error-message">{error}</div>
            )}

            <div className="interest-form-actions">
              {!editingId && (
                <button
                  type="button"
                  className="interest-form-button secondary"
                  onClick={handleHideForm}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="interest-form-button primary"
                disabled={contextLoading}
              >
                {contextLoading
                  ? editingId
                    ? 'Updating...'
                    : 'Adding...'
                  : editingId
                    ? 'Update Interest'
                    : 'Add Interest'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="interest-form-button secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Display existing interests */}
        {interests && interests.length > 0 && (
          <div className="interests-list">
            <h3>Your Interests</h3>
            {interests.map(interest => (
              <div key={interest._id} className="interest-item">
                <div className="interest-content">
                  <div className="interest-title-section">
                    <span className="interest-dot">●</span>
                    <h4 className="interest-title">{interest.interest}</h4>
                  </div>
                </div>
                <div className="interest-actions-section">
                  {deletingId === interest._id ? (
                    <div className="delete-confirmation">
                      <div className="delete-confirmation-text-container">
                        <span className="delete-confirmation-text">
                          Delete this interest?
                        </span>
                      </div>
                      <div className="delete-confirmation-buttons">
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(interest._id)}
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          className="cancel-delete-button"
                          onClick={cancelDelete}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="interest-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleEdit(interest)}
                        title="Edit interest"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteClick(interest._id)}
                        title="Delete interest"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="interest-date">
                  Last updated:{' '}
                  {new Date(interest.lastUpdate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestForm;
