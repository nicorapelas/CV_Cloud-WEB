import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as EmployHistoryContext } from '../../../../context/EmployHistoryContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import './EmployHistoryForm.css';

const EmployHistoryForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);
  const {
    state: { employHistorys, loading: contextLoading, error },
    fetchEmployHistorys,
    createEmployHistory,
    editEmployHistory,
    deleteEmployHistory,
    clearEmployHistoryErrors,
  } = useContext(EmployHistoryContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    position: '',
    description: '',
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

  // Update form data when employHistorys from context changes
  useEffect(() => {
    if (employHistorys && employHistorys.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        position: '',
        description: '',
      });
      setEditingId(null);
    }
  }, [employHistorys]);

  // Update form visibility when employHistorys changes
  useEffect(() => {
    console.log('employHistorys', employHistorys);

    // Show form when there are no employment histories, hide when there are employment histories and not editing
    if (!employHistorys || employHistorys.length === 0) {
      setShowForm(true);
    } else if (employHistorys.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [employHistorys, editingId]); // Dependency on employHistorys and editingId

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'employment-history') {
      console.log('🔄 Employment history update received:', lastUpdate);

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
        fetchEmployHistorys().finally(() => {
          setIsRefreshing(false);
        });
      }, 500);
    }
  }, [lastUpdate, fetchEmployHistorys]);

  // Fetch employment history on user change
  useEffect(() => {
    if (user) {
      console.log('🔄 Setting up employment history for user:', user.id);

      // Fetch employment history data
      fetchEmployHistorys();
    }
  }, [user, fetchEmployHistorys]);

  // Check for recent updates and refresh if needed
  useEffect(() => {
    if (user && hasRecentUpdate('employment-history', 2) && !isRefreshing) {
      // Check last 2 minutes
      console.log(
        '🔄 Recent update detected, checking if refresh is needed...'
      );

      // Only refresh if we don't have current data or if it's been more than 5 seconds since last refresh
      const now = Date.now();
      const shouldRefresh =
        !employHistorys ||
        employHistorys.length === 0 ||
        !lastRefreshTimestamp.current ||
        now - lastRefreshTimestamp.current > 5000;

      if (shouldRefresh) {
        console.log('🔄 Refreshing data due to recent update...');
        setIsRefreshing(true);
        lastRefreshTimestamp.current = now;
        fetchEmployHistorys().finally(() => {
          setIsRefreshing(false);
        });
      } else {
        console.log('🔄 Skipping refresh - data is current');
      }
    }
  }, [
    user,
    hasRecentUpdate,
    employHistorys,
    isRefreshing,
    fetchEmployHistorys,
  ]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

    // If current is checked, clear end date
    if (name === 'current' && checked) {
      setFormData(prev => ({
        ...prev,
        endDate: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (formData.company.length > 100) {
      newErrors.company = 'Company name must be 100 characters or less';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    } else if (formData.position.length > 100) {
      newErrors.position = 'Position must be 100 characters or less';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
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
        await editEmployHistory({ id: editingId }, { formValues: formData });
        setSuccessMessage('Employment history updated successfully!');
        setEditingId(null);
      } else {
        await createEmployHistory(formData);
        setSuccessMessage('Employment history added successfully!');
      }

      // Clear form after successful submission
      setFormData({
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        position: '',
        description: '',
      });

      // Clear errors
      clearEmployHistoryErrors();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Hide form after successful submission if there are employment histories
      if (employHistorys && employHistorys.length > 0 && !editingId) {
        setTimeout(() => {
          setShowForm(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting employment history:', error);
    }
  };

  const handleEdit = employHistory => {
    setFormData({
      company: employHistory.company || '',
      startDate: employHistory.startDate || '',
      endDate: employHistory.endDate || '',
      current: employHistory.current || false,
      position: employHistory.position || '',
      description: employHistory.description || '',
    });
    setEditingId(employHistory._id);
    setShowForm(true); // Show form when editing

    // Smooth scroll to the very top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowForm = () => {
    setShowForm(true);
    setFormData({
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      position: '',
      description: '',
    });
    setErrors({});
    setSuccessMessage('');

    // Smooth scroll to the very top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHideForm = () => {
    setShowForm(false);
    setFormData({
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      position: '',
      description: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setFormData({
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      position: '',
      description: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are employment histories
    if (employHistorys && employHistorys.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleDeleteClick = employHistoryId => {
    setDeletingId(employHistoryId);
  };

  const confirmDelete = async employHistoryId => {
    try {
      await deleteEmployHistory(employHistoryId);
      setSuccessMessage('Employment history deleted successfully!');

      // Clear form if we were editing the deleted entry
      if (editingId === employHistoryId) {
        setFormData({
          company: '',
          startDate: '',
          endDate: '',
          current: false,
          position: '',
          description: '',
        });
        setEditingId(null);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting employment history:', error);
      setErrors({
        submit: 'Failed to delete employment history. Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="employment-history-form">
      <div className="form-container" ref={formTopRef}>
        <div className="form-header">
          <div className="form-header-icon">💼</div>
          <div className="form-header-content">
            <h2>Employment History</h2>
            <p>Add your work experience and employment history</p>
          </div>
        </div>

        {successMessage && (
          <div className="form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="form-error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Show "Add Employment History" button when there are employment histories and form is hidden */}
        {employHistorys &&
          employHistorys.length > 0 &&
          !showForm &&
          !editingId && (
            <div className="add-employment-history-section">
              <button
                type="button"
                className="add-employment-history-button"
                onClick={handleShowForm}
              >
                Add Employment History
              </button>
              <button
                type="button"
                className="cancel-add-button"
                onClick={handleHideForm}
              >
                Cancel
              </button>
            </div>
          )}

        {/* Show form when there are no employment histories, or when explicitly shown, or when editing */}
        {(!employHistorys ||
          employHistorys.length === 0 ||
          showForm ||
          editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`form ${showForm ? 'form-slide-down' : ''}`}
          >
            <div className="form-section">
              <div className="form-field">
                <label htmlFor="company" className="form-label">
                  Company Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`form-input ${errors.company ? 'form-error' : ''}`}
                  placeholder="Enter company name"
                  maxLength={100}
                />
                {errors.company && (
                  <div className="form-error-message">{errors.company}</div>
                )}
                <div className="form-char-count">
                  {formData.company.length}/100
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="position" className="form-label">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`form-input ${errors.position ? 'form-error' : ''}`}
                  placeholder="Enter your job title/position"
                  maxLength={100}
                />
                {errors.position && (
                  <div className="form-error-message">{errors.position}</div>
                )}
                <div className="form-char-count">
                  {formData.position.length}/100
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="startDate" className="form-label">
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`form-input ${errors.startDate ? 'form-error' : ''}`}
                  />
                  {errors.startDate && (
                    <div className="form-error-message">{errors.startDate}</div>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="endDate" className="form-label">
                    End Date{' '}
                    {!formData.current && <span className="required">*</span>}
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`form-input ${errors.endDate ? 'form-error' : ''}`}
                    disabled={formData.current}
                  />
                  {errors.endDate && (
                    <div className="form-error-message">{errors.endDate}</div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    name="current"
                    checked={formData.current}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span className="checkmark"></span>I am currently employed
                  here
                </label>
              </div>

              <div className="form-field">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-textarea ${errors.description ? 'form-error' : ''}`}
                  placeholder="Describe your role, responsibilities, achievements, and key contributions..."
                  rows={6}
                  maxLength={1000}
                />
                {errors.description && (
                  <div className="form-error-message">{errors.description}</div>
                )}
                <div className="form-char-count">
                  {formData.description.length}/1000
                </div>
              </div>
            </div>

            {successMessage && (
              <div className="form-success">{successMessage}</div>
            )}
            {error && <div className="form-error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="form-button primary"
                disabled={contextLoading}
              >
                {contextLoading
                  ? editingId
                    ? 'Updating...'
                    : 'Adding...'
                  : editingId
                    ? 'Update Employment History'
                    : 'Add Employment History'}
              </button>
            </div>
          </form>
        )}

        {/* Display existing employment history */}
        {employHistorys && employHistorys.length > 0 && (
          <div className="employment-history-list">
            <h3>Your Employment History</h3>
            {employHistorys.map(employHistory => (
              <div key={employHistory._id} className="employment-history-item">
                <div className="employment-history-header">
                  <div className="employment-history-info">
                    <h4>{employHistory.company}</h4>
                    {employHistory.position && (
                      <p className="position">{employHistory.position}</p>
                    )}
                    <p className="dates">
                      {formatDate(employHistory.startDate)} -{' '}
                      {employHistory.current
                        ? 'Present'
                        : formatDate(employHistory.endDate)}
                    </p>
                  </div>
                  <div className="employment-history-actions">
                    {deletingId === employHistory._id ? (
                      <>
                        <span className="delete-confirmation-text">
                          Delete this entry?
                        </span>
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(employHistory._id)}
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
                          onClick={() => handleEdit(employHistory)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteClick(employHistory._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {employHistory.description && (
                  <div className="employment-history-description">
                    <p>{employHistory.description}</p>
                  </div>
                )}
                <div className="employment-history-date">
                  Last updated:{' '}
                  {new Date(employHistory.lastUpdate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployHistoryForm;
