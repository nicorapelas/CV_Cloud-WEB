import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as SecondEduContext } from '../../../../context/SecondEduContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil } from 'lucide-react';
import Loader from '../../../common/loader/Loader';
import './SecondaryEducationForm.css';

const SecondaryEducationForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);

  const {
    state: { secondEdu, loading: contextLoading, error },
    fetchSecondEdu,
    createSecondEdu,
    editSecondEdu,
    deleteSecondEdu,
    clearSecondEduErrors,
  } = useContext(SecondEduContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    schoolName: '',
    startYear: '',
    endYear: '',
    subjects: '',
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

  useEffect(() => {
    fetchSecondEdu();
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

  // Update form data when secondEdu from context changes
  useEffect(() => {
    if (secondEdu && secondEdu.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        schoolName: '',
        startYear: '',
        endYear: '',
        subjects: '',
        additionalInfo: '',
      });
      setEditingId(null);
    }
  }, [secondEdu]);

  // Update form visibility when secondEdu changes
  useEffect(() => {
    console.log('secondEdu', secondEdu);

    // Show form when there are no secondary education entries, hide when there are entries and not editing
    if (!secondEdu || secondEdu.length === 0) {
      setShowForm(true);
    } else if (secondEdu.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [secondEdu, editingId]); // Dependency on secondEdu and editingId

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'secondary-education') {
      console.log('🔄 Secondary education update received:', lastUpdate);

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
        await fetchSecondEdu();
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

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    } else if (formData.schoolName.length > 100) {
      newErrors.schoolName = 'School name must be 100 characters or less';
    }

    if (!formData.startYear.trim()) {
      newErrors.startYear = 'Start year is required';
    }

    if (!formData.endYear.trim()) {
      newErrors.endYear = 'End year is required';
    }

    if (
      formData.startYear &&
      formData.endYear &&
      new Date(formData.endYear) < new Date(formData.startYear)
    ) {
      newErrors.endYear = 'End year cannot be before start year';
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
      clearSecondEduErrors(); // Clear any previous context errors

      // Convert subjects string to array format expected by server
      const subjectsArray = formData.subjects
        ? formData.subjects
            .split(',')
            .map(subject => subject.trim())
            .filter(subject => subject.length > 0)
            .map(subject => ({
              subject: subject,
              key:
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15),
            }))
        : [];

      // Prepare data for submission
      const submissionData = {
        ...formData,
        subjects: subjectsArray,
      };

      if (editingId) {
        // Edit existing secondary education entry
        await editSecondEdu({ id: editingId }, submissionData);
        setEditingId(null);
      } else {
        // Create new secondary education entry
        await createSecondEdu(submissionData);
      }

      // Reset form
      setFormData({
        schoolName: '',
        startYear: '',
        endYear: '',
        subjects: '',
        additionalInfo: '',
      });

      // Check if there was an error from the context
      if (!error) {
        setSuccessMessage(
          editingId
            ? 'Secondary education updated successfully!'
            : 'Secondary education added successfully!'
        );
        setTimeout(() => setSuccessMessage(''), 3000);

        // Hide form after successful submission if there are secondary education entries
        if (secondEdu && secondEdu.length > 0 && !editingId) {
          setTimeout(() => {
            setShowForm(false);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error saving secondary education:', error);
      setErrors({
        submit: 'Failed to save secondary education. Please try again.',
      });
    }
  };

  const handleEdit = education => {
    setEditingId(education._id);

    // Convert subjects array back to string for editing
    const subjectsString =
      education.subjects && Array.isArray(education.subjects)
        ? education.subjects.map(subject => subject.subject).join(', ')
        : education.subjects || '';

    setFormData({
      schoolName: education.schoolName || '',
      startYear: education.startYear || '',
      endYear: education.endYear || '',
      subjects: subjectsString,
      additionalInfo: education.additionalInfo || '',
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
      schoolName: '',
      startYear: '',
      endYear: '',
      subjects: '',
      additionalInfo: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are secondary education entries
    if (secondEdu && secondEdu.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    setFormData({
      schoolName: '',
      startYear: '',
      endYear: '',
      subjects: '',
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
      schoolName: '',
      startYear: '',
      endYear: '',
      subjects: '',
      additionalInfo: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleDeleteClick = educationId => {
    setDeletingId(educationId);
  };

  const confirmDelete = async educationId => {
    try {
      await deleteSecondEdu(educationId);
      setSuccessMessage('Secondary education deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Clear form if we were editing the deleted entry
      if (editingId === educationId) {
        setFormData({
          schoolName: '',
          startYear: '',
          endYear: '',
          subjects: '',
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
    <div className="secondary-education-form-field">
      <label htmlFor={name} className="secondary-education-form-label">
        {label}{' '}
        {required && <span className="secondary-education-required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`secondary-education-form-input ${errors[name] ? 'secondary-education-form-error' : ''}`}
        maxLength={maxLength}
      />
      {errors[name] && (
        <div className="secondary-education-form-error-message">
          {errors[name]}
        </div>
      )}
    </div>
  );

  if (contextLoading && !secondEdu) {
    return <Loader message="Loading secondary education..." />;
  }

  return (
    <div className="secondary-education-form">
      <div className="secondary-education-form-container" ref={formTopRef}>
        <div className="secondary-education-form-header">
          <div className="secondary-education-form-header-icon">🎓</div>
          <div className="secondary-education-form-header-content">
            <h2>Secondary Education</h2>
            <p>Add your secondary education details</p>
          </div>
        </div>

        {successMessage && (
          <div className="secondary-education-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="secondary-education-form-error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Show "Add Secondary Education" button when there are secondary education entries and form is hidden */}
        {secondEdu && secondEdu.length > 0 && !showForm && !editingId && (
          <div className="secondary-education-add-section">
            <button
              type="button"
              className="secondary-education-add-button"
              onClick={handleShowForm}
            >
              Add Secondary Education
            </button>
          </div>
        )}

        {/* Show form when there are no secondary education entries, or when explicitly shown, or when editing */}
        {(!secondEdu || secondEdu.length === 0 || showForm || editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`secondary-education-form-element ${showForm ? 'secondary-education-slide-down' : ''}`}
          >
            <div className="secondary-education-form-section">
              <div className="secondary-education-form-field">
                <label
                  htmlFor="schoolName"
                  className="secondary-education-form-label"
                >
                  School Name{' '}
                  <span className="secondary-education-required">*</span>
                </label>
                <input
                  type="text"
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className={`secondary-education-form-input ${errors.schoolName ? 'secondary-education-form-error' : ''}`}
                  placeholder="Enter school name"
                  maxLength={100}
                />
                {errors.schoolName && (
                  <div className="secondary-education-form-error-message">
                    {errors.schoolName}
                  </div>
                )}
                <div className="secondary-education-form-char-count">
                  {formData.schoolName.length}/100
                </div>
              </div>

              <div className="secondary-education-form-row">
                <div className="secondary-education-form-col">
                  <div className="secondary-education-form-field">
                    <label
                      htmlFor="startYear"
                      className="secondary-education-form-label"
                    >
                      Start Year{' '}
                      <span className="secondary-education-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="startYear"
                      name="startYear"
                      value={formData.startYear}
                      onChange={handleInputChange}
                      className={`secondary-education-form-input ${errors.startYear ? 'secondary-education-form-error' : ''}`}
                      placeholder="e.g., 2015"
                      maxLength={4}
                    />
                    {errors.startYear && (
                      <div className="secondary-education-form-error-message">
                        {errors.startYear}
                      </div>
                    )}
                  </div>
                </div>
                <div className="secondary-education-form-col">
                  <div className="secondary-education-form-field">
                    <label
                      htmlFor="endYear"
                      className="secondary-education-form-label"
                    >
                      End Year{' '}
                      <span className="secondary-education-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="endYear"
                      name="endYear"
                      value={formData.endYear}
                      onChange={handleInputChange}
                      className={`secondary-education-form-input ${errors.endYear ? 'secondary-education-form-error' : ''}`}
                      placeholder="e.g., 2019"
                      maxLength={4}
                    />
                    {errors.endYear && (
                      <div className="secondary-education-form-error-message">
                        {errors.endYear}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="secondary-education-form-field">
                <label
                  htmlFor="subjects"
                  className="secondary-education-form-label"
                >
                  Subjects
                </label>
                <textarea
                  id="subjects"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleInputChange}
                  className={`secondary-education-form-textarea ${errors.subjects ? 'secondary-education-form-error' : ''}`}
                  placeholder="List your subjects (e.g., Mathematics, Science, English, etc.)"
                  rows={3}
                  maxLength={200}
                />
                {errors.subjects && (
                  <div className="secondary-education-form-error-message">
                    {errors.subjects}
                  </div>
                )}
                <div className="secondary-education-form-char-count">
                  {formData.subjects.length}/200
                </div>
              </div>

              <div className="secondary-education-form-field">
                <label
                  htmlFor="additionalInfo"
                  className="secondary-education-form-label"
                >
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  className={`secondary-education-form-textarea ${errors.additionalInfo ? 'secondary-education-form-error' : ''}`}
                  placeholder="Any additional information about your secondary education (achievements, activities, etc.)"
                  rows={4}
                  maxLength={500}
                />
                {errors.additionalInfo && (
                  <div className="secondary-education-form-error-message">
                    {errors.additionalInfo}
                  </div>
                )}
                <div className="secondary-education-form-char-count">
                  {formData.additionalInfo.length}/500
                </div>
              </div>
            </div>

            <div className="secondary-education-form-actions">
              <button
                type="button"
                className="secondary-education-form-button secondary"
                onClick={editingId ? handleCancel : handleHideForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="secondary-education-form-button primary"
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

        {/* Display existing secondary education entries */}
        {secondEdu && secondEdu.length > 0 && (
          <div className="secondary-education-list">
            <h3>Your Secondary Education</h3>
            {secondEdu.map(education => (
              <div key={education._id} className="secondary-education-item">
                <div className="secondary-education-header">
                  <h4>{education.schoolName}</h4>
                  <div className="secondary-education-actions">
                    {deletingId === education._id ? (
                      <>
                        <span className="delete-confirmation-text">
                          Delete this entry?
                        </span>
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(education._id)}
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
                          onClick={() => handleEdit(education)}
                          title="Edit education"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteClick(education._id)}
                          title="Delete education"
                        >
                          <Trash size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="secondary-education-dates">
                  {education.startYear} - {education.endYear || 'Present'}
                </div>
                {education.subjects && (
                  <div className="secondary-education-subjects">
                    <strong>Subjects:</strong>{' '}
                    {Array.isArray(education.subjects)
                      ? education.subjects
                          .map(subject => subject.subject)
                          .join(', ')
                      : education.subjects}
                  </div>
                )}
                {education.additionalInfo && (
                  <div className="secondary-education-additional">
                    <strong>Additional Info:</strong> {education.additionalInfo}
                  </div>
                )}
                <div className="secondary-education-date">
                  Last updated:{' '}
                  {new Date(education.lastUpdate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondaryEducationForm;
