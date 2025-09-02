import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as ExperienceContext } from '../../../../context/ExperienceContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil } from 'lucide-react';
import Loader from '../../../common/loader/Loader';
import './ExperienceForm.css';

const ExperienceForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);

  const {
    state: { experiences, loading: contextLoading, error },
    fetchExperiences,
    createExperience,
    editExperience,
    deleteExperience,
    clearExperienceErrors,
  } = useContext(ExperienceContext);

  // Real-time context
  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  // Ref to track last refresh to prevent multiple rapid refreshes
  const lastRefreshTimestamp = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // Start with form hidden

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

  // Update form data when context data changes
  useEffect(() => {
    console.log('experiences', experiences);

    // Show form when there are no experiences, hide when there are experiences and not editing
    if (!experiences || experiences.length === 0) {
      setShowForm(true);
    } else if (experiences.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [experiences, editingId]); // Dependency on experiences and editingId

  // Listen for real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'experience') {
      console.log('🔄 Real-time update received for experience:', lastUpdate);
      console.log('🔄 Current experiences before refresh:', experiences);

      setIsRefreshing(true);

      // Add a small delay to ensure the server has processed the update
      setTimeout(async () => {
        await fetchExperiences();
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

    if (!formData.title.trim()) {
      newErrors.title = 'Experience title is required';
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
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
      setSuccessMessage('');
      clearExperienceErrors(); // Clear any previous context errors

      if (editingId) {
        // Edit existing experience
        await editExperience({ id: editingId }, { formValues: formData });
        setEditingId(null);
      } else {
        // Create new experience
        await createExperience(formData);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
      });

      // Check if there was an error from the context
      if (!error) {
        setSuccessMessage(
          editingId
            ? 'Experience updated successfully!'
            : 'Experience added successfully!'
        );
        setTimeout(() => setSuccessMessage(''), 3000);

        // Hide form after successful submission if there are experiences
        if (experiences && experiences.length > 0 && !editingId) {
          setTimeout(() => {
            setShowForm(false);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      setErrors({ submit: 'Failed to save experience. Please try again.' });
    }
  };

  const handleEdit = experience => {
    setEditingId(experience._id);
    setFormData({
      title: experience.title || '',
      description: experience.description || '',
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
      title: '',
      description: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are experiences
    if (experiences && experiences.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    setFormData({
      title: '',
      description: '',
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
      title: '',
      description: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleDeleteClick = experienceId => {
    setDeletingId(experienceId);
  };

  const confirmDelete = async experienceId => {
    try {
      await deleteExperience(experienceId);
      setSuccessMessage('Experience deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting experience:', error);
      setErrors({ submit: 'Failed to delete experience. Please try again.' });
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
    <div className="experience-form-field">
      <label htmlFor={name} className="experience-form-label">
        {label} {required && <span className="experience-required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`experience-form-input ${errors[name] ? 'experience-form-error' : ''}`}
        maxLength={maxLength}
      />
      {errors[name] && (
        <div className="experience-form-error-message">{errors[name]}</div>
      )}
    </div>
  );

  if (contextLoading && !experiences) {
    return <Loader message="Loading experiences..." />;
  }

  return (
    <div className="experience-form">
      <div className="experience-form-container" ref={formTopRef}>
        <div className="experience-form-header">
          <div className="experience-form-header-icon">💼</div>
          <div className="experience-form-header-content">
            <h2>Work Experience</h2>
            <p>Add your professional work history</p>
          </div>
        </div>

        {successMessage && (
          <div className="experience-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {errors.submit && (
          <div className="experience-form-error-message">
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Show "Add Experience" button when there are experiences and form is hidden */}
        {experiences && experiences.length > 0 && !showForm && !editingId && (
          <div className="experience-add-section">
            <button
              type="button"
              className="experience-add-button"
              onClick={handleShowForm}
            >
              Add Experience
            </button>
          </div>
        )}

        {/* Show form when there are no experiences, or when explicitly shown, or when editing */}
        {(!experiences ||
          experiences.length === 0 ||
          showForm ||
          editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`experience-form-element ${showForm ? 'experience-slide-down' : ''}`}
          >
            <div className="experience-form-section">
              <h3>{editingId ? 'Edit Experience' : 'Add New Experience'}</h3>

              {renderField(
                'title',
                'Experience Title',
                'text',
                'e.g., Bartender, Tour Guide, etc.',
                true,
                100
              )}

              <div className="experience-form-field">
                <label htmlFor="description" className="experience-form-label">
                  Experience Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your role, responsibilities, achievements, and key contributions..."
                  className={`experience-form-textarea ${errors.description ? 'experience-form-error' : ''}`}
                  rows={6}
                  maxLength={1000}
                />
                {errors.description && (
                  <div className="experience-form-error-message">
                    {errors.description}
                  </div>
                )}
                <div className="experience-form-char-count">
                  {formData.description.length}/1000 characters
                </div>
              </div>
            </div>

            <div className="experience-form-actions">
              <button
                type="button"
                className="experience-form-button secondary"
                onClick={editingId ? handleCancel : handleHideForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="experience-form-button primary"
                disabled={contextLoading}
              >
                {contextLoading
                  ? 'Saving...'
                  : editingId
                    ? 'Update Experience'
                    : 'Add Experience'}
              </button>
            </div>
          </form>
        )}

        {/* Display existing experiences */}
        {experiences && experiences.length > 0 && (
          <div className="experiences-list">
            <h3>Your Experiences</h3>
            {experiences.map((experience, index) => (
              <div key={experience._id} className="experience-item">
                <div className="experience-header">
                  <h4>{experience.title}</h4>
                  <div className="experience-actions">
                    {deletingId === experience._id ? (
                      <>
                        <span className="delete-confirmation-text">
                          Delete this entry?
                        </span>
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(experience._id)}
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
                          onClick={() => handleEdit(experience)}
                          title="Edit experience"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteClick(experience._id)}
                          title="Delete experience"
                        >
                          <Trash size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {experience.description && (
                  <p className="experience-description">
                    {experience.description}
                  </p>
                )}
                <p className="experience-date">
                  Last updated:{' '}
                  {experience.lastUpdate
                    ? new Date(experience.lastUpdate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceForm;
