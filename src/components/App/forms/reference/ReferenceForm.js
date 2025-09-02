import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as ReferenceContext } from '../../../../context/ReferenceContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil } from 'lucide-react';
import Loader from '../../../common/loader/Loader';
import './ReferenceForm.css';

const ReferenceForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);
  const {
    state: { references, loading: contextLoading, error },
    fetchReferences,
    createReference,
    editReference,
    deleteReference,
    clearReferenceErrors,
  } = useContext(ReferenceContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // Start with form hidden

  // Ref to track last refresh to prevent multiple rapid refreshes
  const lastRefreshTimestamp = useRef(null);

  useEffect(() => {
    fetchReferences();
  }, []);

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

  // Update form data when references from context changes
  useEffect(() => {
    if (references && references.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
      });
      setEditingId(null);
    }
  }, [references]);

  // Update form visibility when references changes
  useEffect(() => {
    console.log('references', references);

    // Show form when there are no references, hide when there are references and not editing
    if (!references || references.length === 0) {
      setShowForm(true);
    } else if (references.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [references, editingId]); // Dependency on references and editingId

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'reference') {
      console.log('🔄 Reference update received:', lastUpdate);

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

      // Add a small delay to ensure the server has processed the update
      setTimeout(async () => {
        await fetchReferences();
        setIsRefreshing(false);
      }, 500);
    }
  }, [lastUpdate]); // Dependency on lastUpdate from real-time context

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

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Reference name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Reference name must be 100 characters or less';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    } else if (formData.company.length > 100) {
      newErrors.company = 'Company must be 100 characters or less';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be 20 characters or less';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email && formData.email.length > 100) {
      newErrors.email = 'Email must be 100 characters or less';
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
      setSuccessMessage('');
      clearReferenceErrors(); // Clear any previous context errors

      if (editingId) {
        // Edit existing reference
        await editReference({ id: editingId }, { formValues: formData });
        setEditingId(null);
      } else {
        // Create new reference
        await createReference(formData);
      }

      // Reset form
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
      });

      // Check if there was an error from the context
      if (!error) {
        setSuccessMessage(
          editingId
            ? 'Reference updated successfully!'
            : 'Reference added successfully!'
        );
        setTimeout(() => setSuccessMessage(''), 3000);

        // Hide form after successful submission if there are references
        if (references && references.length > 0 && !editingId) {
          setTimeout(() => {
            setShowForm(false);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error saving reference:', error);
      setErrors({
        submit: 'Failed to save reference. Please try again.',
      });
    }
  };

  const handleEdit = reference => {
    setEditingId(reference._id);
    setFormData({
      name: reference.name || '',
      company: reference.company || '',
      phone: reference.phone || '',
      email: reference.email || '',
    });

    // Show form when editing
    setShowForm(true);

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

  const handleCancel = () => {
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are references
    if (references && references.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
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
      name: '',
      company: '',
      phone: '',
      email: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleDeleteClick = referenceId => {
    setDeletingId(referenceId);
  };

  const confirmDelete = async referenceId => {
    try {
      await deleteReference(referenceId);
      setSuccessMessage('Reference deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Clear form if we were editing the deleted reference
      if (editingId === referenceId) {
        setFormData({
          name: '',
          company: '',
          phone: '',
          email: '',
        });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error deleting reference:', error);
      setErrors({
        submit: 'Failed to delete reference. Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const renderField = (
    name,
    label,
    type = 'text',
    placeholder = '',
    required = false,
    maxLength = null
  ) => (
    <div className="reference-form-field">
      <label htmlFor={name} className="reference-form-label">
        {label} {required && <span className="reference-required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`reference-form-input ${errors[name] ? 'reference-form-error' : ''}`}
        maxLength={maxLength}
      />
      {errors[name] && (
        <div className="reference-form-error-message">{errors[name]}</div>
      )}
    </div>
  );

  if (contextLoading && !references) {
    return <Loader message="Loading references..." />;
  }

  return (
    <div className="reference-form">
      <div className="reference-form-container" ref={formTopRef}>
        <div className="reference-form-header">
          <div className="reference-form-header-icon">👥</div>
          <div className="reference-form-header-content">
            <h2>References</h2>
            <p>Add your professional references</p>
          </div>
        </div>

        {successMessage && (
          <div className="reference-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="reference-form-error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Show "Add Reference" button when there are references and form is hidden */}
        {references && references.length > 0 && !showForm && !editingId && (
          <div className="reference-add-section">
            <button
              type="button"
              className="reference-add-button"
              onClick={handleShowForm}
            >
              Add Reference
            </button>
          </div>
        )}

        {/* Show form when there are no references, or when explicitly shown, or when editing */}
        {(!references || references.length === 0 || showForm || editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`reference-form-element ${showForm ? 'reference-slide-down' : ''}`}
          >
            <div className="reference-form-section">
              <div className="reference-form-field">
                <label htmlFor="name" className="reference-form-label">
                  Reference Name <span className="reference-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`reference-form-input ${errors.name ? 'reference-form-error' : ''}`}
                  placeholder="Enter reference name"
                  maxLength={100}
                />
                {errors.name && (
                  <div className="reference-form-error-message">
                    {errors.name}
                  </div>
                )}
                <div className="reference-form-char-count">
                  {formData.name.length}/100
                </div>
              </div>

              <div className="reference-form-field">
                <label htmlFor="company" className="reference-form-label">
                  Company <span className="reference-required">*</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`reference-form-input ${errors.company ? 'reference-form-error' : ''}`}
                  placeholder="Enter company name"
                  maxLength={100}
                />
                {errors.company && (
                  <div className="reference-form-error-message">
                    {errors.company}
                  </div>
                )}
                <div className="reference-form-char-count">
                  {formData.company.length}/100
                </div>
              </div>

              <div className="reference-form-field">
                <label htmlFor="phone" className="reference-form-label">
                  Phone Number <span className="reference-required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`reference-form-input ${errors.phone ? 'reference-form-error' : ''}`}
                  placeholder="Enter phone number"
                  maxLength={20}
                />
                {errors.phone && (
                  <div className="reference-form-error-message">
                    {errors.phone}
                  </div>
                )}
              </div>

              <div className="reference-form-field">
                <label htmlFor="email" className="reference-form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`reference-form-input ${errors.email ? 'reference-form-error' : ''}`}
                  placeholder="Enter email address"
                  maxLength={100}
                />
                {errors.email && (
                  <div className="reference-form-error-message">
                    {errors.email}
                  </div>
                )}
                <div className="reference-form-char-count">
                  {formData.email.length}/100
                </div>
              </div>
            </div>

            <div className="reference-form-actions">
              <button
                type="button"
                className="reference-form-button secondary"
                onClick={editingId ? handleCancel : handleHideForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="reference-form-button primary"
                disabled={contextLoading}
              >
                {contextLoading
                  ? editingId
                    ? 'Updating...'
                    : 'Adding...'
                  : editingId
                    ? 'Update Reference'
                    : 'Add Reference'}
              </button>
            </div>
          </form>
        )}

        {/* Display existing references */}
        {references && references.length > 0 && (
          <div className="reference-list">
            <h3>Your References</h3>
            {references.map(reference => (
              <div key={reference._id} className="reference-item">
                <div className="reference-header">
                  <h4>{reference.name}</h4>
                  <div className="reference-actions">
                    {deletingId === reference._id ? (
                      <>
                        <span className="delete-confirmation-text">
                          Delete this reference?
                        </span>
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(reference._id)}
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
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEdit(reference)}
                          title="Edit reference"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteClick(reference._id)}
                          title="Delete reference"
                        >
                          <Trash size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {reference.company && (
                  <div className="reference-company">
                    <strong>Company:</strong> {reference.company}
                  </div>
                )}
                <div className="reference-contact">
                  <div className="reference-phone">
                    <strong>Phone:</strong> {reference.phone}
                  </div>
                  {reference.email && (
                    <div className="reference-email">
                      <strong>Email:</strong> {reference.email}
                    </div>
                  )}
                </div>
                <div className="reference-date">
                  Last updated:{' '}
                  {new Date(reference.lastUpdate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferenceForm;
