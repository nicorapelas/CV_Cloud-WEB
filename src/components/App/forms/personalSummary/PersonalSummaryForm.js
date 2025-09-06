import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as PersonalSummaryContext } from '../../../../context/PersonalSummaryContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import Loader from '../../../common/loader/Loader';
import './PersonalSummaryForm.css';

const PersonalSummaryForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);

  const {
    state: { personalSummary, loading: contextLoading, error: contextError },
    fetchPersonalSummary,
    createPersonalSummary,
    editPersonalSummary,
    clearPersonalSummaryErrors,
  } = useContext(PersonalSummaryContext);

  // Real-time context
  const {
    authenticateUser,
    sendUserActivity,
    lastUpdate,
    isConnected,
    hasRecentUpdate,
  } = useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  // Ref to track last refresh to prevent multiple rapid refreshes
  const lastRefreshTimestamp = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    content: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPersonalSummary();
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

  // Update form data when context data changes
  useEffect(() => {
    console.log('personalSummary', personalSummary);
    if (personalSummary && personalSummary.length > 0) {
      const data = personalSummary[0];
      setFormData({
        content: data.content || '',
      });
    }
  }, [personalSummary]); // Dependency on personalSummary from context

  // Listen for real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'personal-summary') {
      console.log(
        '🔄 Real-time update received for personal summary:',
        lastUpdate
      );
      console.log(
        '🔄 Current personalSummary before refresh:',
        personalSummary
      );

      setIsRefreshing(true);

      // Add a small delay to ensure the server has processed the update
      setTimeout(async () => {
        await fetchPersonalSummary();
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

    if (!formData.content.trim()) {
      newErrors.content = 'Personal summary is required';
    } else if (formData.content.length > 1000) {
      newErrors.content = 'Personal summary must be 1000 characters or less';
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
      clearPersonalSummaryErrors(); // Clear any previous context errors

      // Check if personal summary already exists to determine whether to create or edit
      if (personalSummary && personalSummary.length > 0) {
        // Edit existing personal summary
        const existingSummary = personalSummary[0];
        await editPersonalSummary({
          id: existingSummary._id,
          content: formData.content,
        });
      } else {
        // Create new personal summary
        await createPersonalSummary(formData);
      }

      // Check if there was an error from the context
      if (!contextError) {
        setSuccessMessage('Personal summary saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving personal summary:', error);
      setErrors({
        submit: 'Failed to save personal summary. Please try again.',
      });
    }
  };

  if (contextLoading && !formData.content) {
    return <Loader message="Loading personal summary..." />;
  }

  return (
    <div className="personal-summary-form">
      <div className="personal-summary-form-container" ref={formTopRef}>
        <div className="personal-summary-form-header">
          <div className="personal-summary-form-header-icon">📝</div>
          <div className="personal-summary-form-header-content">
            <h2>Personal Summary</h2>
            <p>
              Write a compelling summary of your professional background and
              career objectives
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="personal-summary-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {errors.submit && (
          <div className="personal-summary-form-error-message">
            <p>{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="personal-summary-form-element">
          <div className="personal-summary-form-section">
            <h3>Professional Summary</h3>

            <div className="personal-summary-form-field">
              <label htmlFor="content" className="personal-summary-form-label">
                Summary Content{' '}
                <span className="personal-summary-required">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write a compelling professional summary that highlights your key skills, experience, and career objectives..."
                className={`personal-summary-form-textarea ${errors.content ? 'personal-summary-form-error' : ''}`}
                rows={8}
                maxLength={1000}
              />
              {errors.content && (
                <div className="personal-summary-form-error-message">
                  {errors.content}
                </div>
              )}
              <div className="personal-summary-form-char-count">
                {formData.content.length}/1000 characters
              </div>
            </div>
          </div>

          <div className="personal-summary-form-actions">
            <Link
              to="/app/dashboard"
              className="personal-summary-form-button secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="personal-summary-form-button primary"
              disabled={contextLoading}
            >
              {contextLoading ? 'Saving...' : 'Save Summary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalSummaryForm;
