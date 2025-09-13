import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as AttributeContext } from '../../../../context/AttributeContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil } from 'lucide-react';
import './AttributeForm.css';

const AttributeForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);
  const {
    state: { attributes, loading: contextLoading, error },
    fetchAttributes,
    createAttribute,
    editAttribute,
    deleteAttribute,
    clearAttributeErrors,
  } = useContext(AttributeContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    attribute: '',
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

  // Update form data when attributes from context changes
  useEffect(() => {
    if (attributes && attributes.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        attribute: '',
      });
      setEditingId(null);
    }
  }, [attributes]);

  // Update form visibility when attributes changes
  useEffect(() => {
    console.log('attributes', attributes);

    // Show form when there are no attributes, hide when there are attributes and not editing
    if (!attributes || attributes.length === 0) {
      setShowForm(true);
    } else if (attributes.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [attributes, editingId]); // Dependency on attributes and editingId

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'attribute') {
      console.log('🔄 Attribute update received:', lastUpdate);

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
        fetchAttributes().finally(() => {
          setIsRefreshing(false);
        });
      }, 500);
    }
  }, [lastUpdate, fetchAttributes]);

  // Fetch attributes on user change
  useEffect(() => {
    if (user) {
      console.log('🔄 Setting up attributes for user:', user.id);

      // Fetch attributes data
      fetchAttributes();
    }
  }, [user, fetchAttributes]);

  // Check for recent updates and refresh if needed
  useEffect(() => {
    if (user && hasRecentUpdate('attribute', 2) && !isRefreshing) {
      // Check last 2 minutes
      console.log(
        '🔄 Recent update detected, checking if refresh is needed...'
      );

      // Only refresh if we don't have current data or if it's been more than 5 seconds since last refresh
      const now = Date.now();
      const shouldRefresh =
        !attributes ||
        attributes.length === 0 ||
        !lastRefreshTimestamp.current ||
        now - lastRefreshTimestamp.current > 5000;

      if (shouldRefresh) {
        console.log('🔄 Refreshing data due to recent update...');
        setIsRefreshing(true);
        lastRefreshTimestamp.current = now;
        fetchAttributes().finally(() => {
          setIsRefreshing(false);
        });
      } else {
        console.log('🔄 Skipping refresh - data is current');
      }
    }
  }, [user, hasRecentUpdate, attributes, isRefreshing, fetchAttributes]);

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

    if (!formData.attribute.trim()) {
      newErrors.attribute = 'Attribute is required';
    } else if (formData.attribute.length > 50) {
      newErrors.attribute = 'Attribute must be 50 characters or less';
    }

    // Check for duplicate attributes
    if (attributes && attributes.length > 0) {
      const duplicate = attributes.find(
        attribute =>
          attribute.attribute.toLowerCase() ===
            formData.attribute.toLowerCase() && attribute._id !== editingId
      );
      if (duplicate) {
        newErrors.attribute = 'This attribute already exists';
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
        await editAttribute({ id: editingId, attribute: formData.attribute });
        setSuccessMessage('Attribute updated successfully!');
        setEditingId(null);
      } else {
        // For creating, we need to send an array with ALL attributes (existing + new)
        const existingAttributes = attributes
          ? attributes.map(attribute => ({ attribute: attribute.attribute }))
          : [];
        const newAttributeArray = [
          ...existingAttributes,
          { attribute: formData.attribute },
        ];
        console.log('Sending attribute array:', newAttributeArray); // Debug log
        await createAttribute(newAttributeArray);
        setSuccessMessage('Attribute added successfully!');
      }

      // Clear form after successful submission
      setFormData({
        attribute: '',
      });

      // Clear errors
      clearAttributeErrors();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Hide form after successful submission if there are attributes
      if (attributes && attributes.length > 0 && !editingId) {
        setTimeout(() => {
          setShowForm(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting attribute:', error);
    }
  };

  const handleEdit = attribute => {
    setFormData({
      attribute: attribute.attribute || '',
    });
    setEditingId(attribute._id);
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
      attribute: '',
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
      attribute: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setFormData({
      attribute: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are attributes
    if (attributes && attributes.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleDeleteClick = attributeId => {
    setDeletingId(attributeId);
  };

  const confirmDelete = async attributeId => {
    try {
      await deleteAttribute(attributeId);
      setSuccessMessage('Attribute deleted successfully!');

      // Clear form if we were editing the deleted entry
      if (editingId === attributeId) {
        setFormData({
          attribute: '',
        });
        setEditingId(null);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting attribute:', error);
      setErrors({ submit: 'Failed to delete attribute. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="attribute-form">
      <div className="attribute-form-container" ref={formTopRef}>
        <div className="attribute-form-header">
          <div className="attribute-form-header-icon">✨</div>
          <div className="attribute-form-header-content">
            <h2>Attributes</h2>
            <p>Add your personal attributes and qualities</p>
          </div>
        </div>

        {successMessage && (
          <div className="attribute-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="attribute-form-error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Show "Add Attribute" button when there are attributes and form is hidden */}
        {attributes && attributes.length > 0 && !showForm && !editingId && (
          <div className="attribute-add-section">
            <button
              type="button"
              className="attribute-add-button"
              onClick={handleShowForm}
            >
              Add Attribute
            </button>
          </div>
        )}

        {/* Show form when there are no attributes, or when explicitly shown, or when editing */}
        {(!attributes || attributes.length === 0 || showForm || editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`attribute-form-element ${showForm ? 'attribute-form-slide-down' : ''}`}
          >
            <div className="attribute-form-section">
              <div className="attribute-form-field">
                <label htmlFor="attribute" className="attribute-form-label">
                  Attribute <span className="attribute-required">*</span>
                </label>
                <input
                  type="text"
                  id="attribute"
                  name="attribute"
                  value={formData.attribute}
                  onChange={handleInputChange}
                  className={`attribute-form-input ${errors.attribute ? 'attribute-form-error' : ''}`}
                  placeholder="Enter a personal attribute (e.g., Creative, Reliable, Team Player)"
                  maxLength={50}
                />
                {errors.attribute && (
                  <div className="attribute-form-error-message">
                    {errors.attribute}
                  </div>
                )}
                <div className="attribute-form-char-count">
                  {formData.attribute.length}/50
                </div>
              </div>
            </div>

            {successMessage && (
              <div style={{ paddingTop: '20px', display: 'block' }}>
                <div className="attribute-form-success">{successMessage}</div>
              </div>
            )}
            {error && (
              <div className="attribute-form-error-message">{error}</div>
            )}

            <div className="attribute-form-actions">
              {!editingId && (
                <button
                  type="button"
                  className="attribute-form-button secondary"
                  onClick={handleHideForm}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="attribute-form-button primary"
                disabled={contextLoading}
              >
                {contextLoading
                  ? editingId
                    ? 'Updating...'
                    : 'Adding...'
                  : editingId
                    ? 'Update Attribute'
                    : 'Add Attribute'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="attribute-form-button secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Display existing attributes */}
        {attributes && attributes.length > 0 && (
          <div className="attributes-list">
            <h3>Your Attributes</h3>
            {attributes.map(attribute => (
              <div key={attribute._id} className="attribute-item">
                <div className="attribute-content">
                  <div className="attribute-title-section">
                    <span className="attribute-dot">●</span>
                    <h4 className="attribute-title">{attribute.attribute}</h4>
                  </div>
                </div>
                <div className="attribute-actions-section">
                  {deletingId === attribute._id ? (
                    <div className="delete-confirmation">
                      <div className="delete-confirmation-text-container">
                        <span className="delete-confirmation-text">
                          Delete this attribute?
                        </span>
                      </div>
                      <div className="delete-confirmation-buttons">
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(attribute._id)}
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
                    <div className="attribute-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleEdit(attribute)}
                        title="Edit attribute"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteClick(attribute._id)}
                        title="Delete attribute"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="attribute-date">
                  Last updated:{' '}
                  {new Date(attribute.lastUpdate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeForm;
