import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as TertEduContext } from '../../../../context/TertEduContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil } from 'lucide-react';
import Loader from '../../../common/loader/Loader';
import './TertiaryEducationForm.css';

const TertiaryEducationForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);
  const {
    state: { tertEdus, loading: contextLoading, error },
    fetchTertEdus,
    createTertEdu,
    editTertEdu,
    deleteTertEdu,
    clearTertEduErrors,
  } = useContext(TertEduContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    instituteName: '',
    startDate: '',
    endDate: '',
    certificationType: '',
    description: '',
    additionalInfo: '',
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

  // Update form data when tertEdus from context changes
  useEffect(() => {
    if (tertEdus && tertEdus.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        instituteName: '',
        startDate: '',
        endDate: '',
        certificationType: '',
        description: '',
        additionalInfo: '',
      });
      setEditingId(null);
    }
  }, [tertEdus]);

  // Update form visibility when tertEdus changes
  useEffect(() => {
    console.log('tertEdus', tertEdus);

    // Show form when there are no tertiary education entries, hide when there are entries and not editing
    if (!tertEdus || tertEdus.length === 0) {
      setShowForm(true);
    } else if (tertEdus.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [tertEdus, editingId]); // Dependency on tertEdus and editingId

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'tertiary-education') {
      console.log('🔄 Tertiary education update received:', lastUpdate);

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
        await fetchTertEdus();
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.instituteName.trim()) {
      newErrors.instituteName = 'Institute name is required';
    } else if (formData.instituteName.length > 100) {
      newErrors.instituteName = 'Institute name must be 100 characters or less';
    }

    if (!formData.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate.trim()) {
      newErrors.endDate = 'End date is required';
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    if (formData.certificationType && formData.certificationType.length > 100) {
      newErrors.certificationType =
        'Certification type must be 100 characters or less';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (formData.additionalInfo && formData.additionalInfo.length > 500) {
      newErrors.additionalInfo =
        'Additional info must be 500 characters or less';
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
      clearTertEduErrors(); // Clear any previous context errors

      if (editingId) {
        // Edit existing tertiary education entry
        await editTertEdu({ id: editingId }, formData);
        setEditingId(null);
      } else {
        // Create new tertiary education entry
        await createTertEdu(formData);
      }

      // Reset form
      setFormData({
        instituteName: '',
        startDate: '',
        endDate: '',
        certificationType: '',
        description: '',
        additionalInfo: '',
      });

      // Check if there was an error from the context
      if (!error) {
        setSuccessMessage(
          editingId
            ? 'Tertiary education updated successfully!'
            : 'Tertiary education added successfully!'
        );
        setTimeout(() => setSuccessMessage(''), 3000);

        // Hide form after successful submission if there are tertiary education entries
        if (tertEdus && tertEdus.length > 0 && !editingId) {
          setTimeout(() => {
            setShowForm(false);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error saving tertiary education:', error);
      setErrors({
        submit: 'Failed to save tertiary education. Please try again.',
      });
    }
  };

  const handleEdit = tertEdu => {
    setEditingId(tertEdu._id);
    setFormData({
      instituteName: tertEdu.instituteName || '',
      startDate: tertEdu.startDate || '',
      endDate: tertEdu.endDate || '',
      certificationType: tertEdu.certificationType || '',
      description: tertEdu.description || '',
      additionalInfo: tertEdu.additionalInfo || '',
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
      instituteName: '',
      startDate: '',
      endDate: '',
      certificationType: '',
      description: '',
      additionalInfo: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are tertiary education entries
    if (tertEdus && tertEdus.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    setFormData({
      instituteName: '',
      startDate: '',
      endDate: '',
      certificationType: '',
      description: '',
      additionalInfo: '',
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
      instituteName: '',
      startDate: '',
      endDate: '',
      certificationType: '',
      description: '',
      additionalInfo: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleDeleteClick = tertEduId => {
    setDeletingId(tertEduId);
  };

  const confirmDelete = async tertEduId => {
    try {
      await deleteTertEdu(tertEduId);
      setSuccessMessage('Tertiary education deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Clear form if we were editing the deleted entry
      if (editingId === tertEduId) {
        setFormData({
          instituteName: '',
          startDate: '',
          endDate: '',
          certificationType: '',
          description: '',
          additionalInfo: '',
        });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error deleting education entry:', error);
      setErrors({
        submit: 'Failed to delete education entry. Please try again.',
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
    <div className="tertiary-education-form-field">
      <label htmlFor={name} className="tertiary-education-form-label">
        {label}{' '}
        {required && <span className="tertiary-education-required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`tertiary-education-form-input ${errors[name] ? 'tertiary-education-form-error' : ''}`}
        maxLength={maxLength}
      />
      {errors[name] && (
        <div className="tertiary-education-form-error-message">
          {errors[name]}
        </div>
      )}
    </div>
  );

  if (contextLoading && !tertEdus) {
    return <Loader message="Loading tertiary education..." />;
  }

  return (
    <div className="tertiary-education-form">
      <div className="tertiary-education-form-container" ref={formTopRef}>
        <div className="tertiary-education-form-header">
          <div className="tertiary-education-form-header-icon">🎓</div>
          <div className="tertiary-education-form-header-content">
            <h2>Tertiary Education</h2>
            <p>Add your tertiary education details</p>
          </div>
        </div>

        {successMessage && (
          <div className="tertiary-education-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="tertiary-education-form-error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Show "Add Tertiary Education" button when there are tertiary education entries and form is hidden */}
        {tertEdus && tertEdus.length > 0 && !showForm && !editingId && (
          <div className="tertiary-education-add-section">
            <button
              type="button"
              className="tertiary-education-add-button"
              onClick={handleShowForm}
            >
              Add Tertiary Education
            </button>
          </div>
        )}

        {/* Show form when there are no tertiary education entries, or when explicitly shown, or when editing */}
        {(!tertEdus || tertEdus.length === 0 || showForm || editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`tertiary-education-form-element ${showForm ? 'tertiary-education-slide-down' : ''}`}
          >
            <div className="tertiary-education-form-section">
              <div className="tertiary-education-form-field">
                <label
                  htmlFor="instituteName"
                  className="tertiary-education-form-label"
                >
                  Institute Name{' '}
                  <span className="tertiary-education-required">*</span>
                </label>
                <input
                  type="text"
                  id="instituteName"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleInputChange}
                  className={`tertiary-education-form-input ${errors.instituteName ? 'tertiary-education-form-error' : ''}`}
                  placeholder="Enter institute name"
                  maxLength={100}
                />
                {errors.instituteName && (
                  <div className="tertiary-education-form-error-message">
                    {errors.instituteName}
                  </div>
                )}
                <div className="tertiary-education-form-char-count">
                  {formData.instituteName.length}/100
                </div>
              </div>

              <div className="tertiary-education-form-row">
                <div className="tertiary-education-form-col">
                  <div className="tertiary-education-form-field">
                    <label
                      htmlFor="startDate"
                      className="tertiary-education-form-label"
                    >
                      Start Date{' '}
                      <span className="tertiary-education-required">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`tertiary-education-form-input ${errors.startDate ? 'tertiary-education-form-error' : ''}`}
                    />
                    {errors.startDate && (
                      <div className="tertiary-education-form-error-message">
                        {errors.startDate}
                      </div>
                    )}
                  </div>
                </div>
                <div className="tertiary-education-form-col">
                  <div className="tertiary-education-form-field">
                    <label
                      htmlFor="endDate"
                      className="tertiary-education-form-label"
                    >
                      End Date{' '}
                      <span className="tertiary-education-required">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`tertiary-education-form-input ${errors.endDate ? 'tertiary-education-form-error' : ''}`}
                    />
                    {errors.endDate && (
                      <div className="tertiary-education-form-error-message">
                        {errors.endDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="tertiary-education-form-field">
                <label
                  htmlFor="certificationType"
                  className="tertiary-education-form-label"
                >
                  Certification Type
                </label>
                <input
                  type="text"
                  id="certificationType"
                  name="certificationType"
                  value={formData.certificationType}
                  onChange={handleInputChange}
                  className={`tertiary-education-form-input ${errors.certificationType ? 'tertiary-education-form-error' : ''}`}
                  placeholder="e.g., Bachelor's Degree, Master's Degree, Diploma, etc."
                  maxLength={100}
                />
                {errors.certificationType && (
                  <div className="tertiary-education-form-error-message">
                    {errors.certificationType}
                  </div>
                )}
                <div className="tertiary-education-form-char-count">
                  {formData.certificationType.length}/100
                </div>
              </div>

              <div className="tertiary-education-form-field">
                <label
                  htmlFor="description"
                  className="tertiary-education-form-label"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`tertiary-education-form-textarea ${errors.description ? 'tertiary-education-form-error' : ''}`}
                  placeholder="Describe your course of study, major, specialization, etc."
                  rows={3}
                  maxLength={500}
                />
                {errors.description && (
                  <div className="tertiary-education-form-error-message">
                    {errors.description}
                  </div>
                )}
                <div className="tertiary-education-form-char-count">
                  {formData.description.length}/500
                </div>
              </div>

              <div className="tertiary-education-form-field">
                <label
                  htmlFor="additionalInfo"
                  className="tertiary-education-form-label"
                >
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  className={`tertiary-education-form-textarea ${errors.additionalInfo ? 'tertiary-education-form-error' : ''}`}
                  placeholder="Any additional information about your tertiary education (achievements, activities, etc.)"
                  rows={4}
                  maxLength={500}
                />
                {errors.additionalInfo && (
                  <div className="tertiary-education-form-error-message">
                    {errors.additionalInfo}
                  </div>
                )}
                <div className="tertiary-education-form-char-count">
                  {formData.additionalInfo.length}/500
                </div>
              </div>
            </div>

            <div className="tertiary-education-form-actions">
              <button
                type="button"
                className="tertiary-education-form-button secondary"
                onClick={editingId ? handleCancel : handleHideForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tertiary-education-form-button primary"
                disabled={contextLoading}
              >
                {contextLoading
                  ? editingId
                    ? 'Updating...'
                    : 'Adding...'
                  : editingId
                    ? 'Update Education'
                    : 'Add Education'}
              </button>
            </div>
          </form>
        )}

        {/* Display existing tertiary education */}
        {tertEdus && tertEdus.length > 0 && (
          <div className="tertiary-education-list">
            <h3>Your Tertiary Education</h3>
            {tertEdus.map(tertEdu => (
              <div key={tertEdu._id} className="tertiary-education-item">
                <div className="tertiary-education-header">
                  <h4>{tertEdu.instituteName}</h4>
                  <div className="tertiary-education-actions">
                    {deletingId === tertEdu._id ? (
                      <>
                        <span className="delete-confirmation-text">
                          Delete this education?
                        </span>
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(tertEdu._id)}
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
                          onClick={() => handleEdit(tertEdu)}
                          title="Edit education"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteClick(tertEdu._id)}
                          title="Delete education"
                        >
                          <Trash size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {tertEdu.certificationType && (
                  <div className="tertiary-education-certification">
                    <strong>Certification:</strong> {tertEdu.certificationType}
                  </div>
                )}
                {(tertEdu.startDate || tertEdu.endDate) && (
                  <div className="tertiary-education-dates">
                    <strong>Duration:</strong> {tertEdu.startDate || 'N/A'} -{' '}
                    {tertEdu.endDate || 'Present'}
                  </div>
                )}
                {tertEdu.description && (
                  <div className="tertiary-education-description">
                    <strong>Description:</strong> {tertEdu.description}
                  </div>
                )}
                {tertEdu.additionalInfo && (
                  <div className="tertiary-education-additional">
                    <strong>Additional Info:</strong> {tertEdu.additionalInfo}
                  </div>
                )}
                <div className="tertiary-education-date">
                  Last updated:{' '}
                  {new Date(tertEdu.lastUpdate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TertiaryEducationForm;
