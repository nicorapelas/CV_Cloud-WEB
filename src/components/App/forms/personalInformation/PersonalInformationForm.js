import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as PersonalInfoContext } from '../../../../context/PersonalInfoContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import Loader from '../../../common/loader/Loader';
import './PersonalInformationForm.css';

const PersonalInformationForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);

  const {
    state: { personalInfo, loading: contextLoading, error: contextError },
    fetchPersonalInfo,
    createPersonalInfo,
    editPersonalInfo,
    clearErrors,
  } = useContext(PersonalInfoContext);

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
    fullName: '',
    dateOfBirth: '',
    idNumber: '',
    gender: '',
    saCitizen: false,
    ppNumber: '',
    nationality: '',
    driversLicense: false,
    licenseCode: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    console.log('personalInfo', personalInfo);
    if (personalInfo && personalInfo.length > 0) {
      const data = personalInfo[0];

      // Convert ISO date string to YYYY-MM-DD format for HTML date input
      let formattedDateOfBirth = '';
      if (data.dateOfBirth) {
        try {
          const date = new Date(data.dateOfBirth);
          formattedDateOfBirth = date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
        } catch (error) {
          console.error('Error parsing date of birth:', error);
          formattedDateOfBirth = '';
        }
      }

      setFormData({
        fullName: data.fullName || '',
        dateOfBirth: formattedDateOfBirth,
        idNumber: data.idNumber || '',
        gender: data.gender || '',
        saCitizen: data.saCitizen || false,
        ppNumber: data.ppNumber || '',
        nationality: data.nationality || '',
        driversLicense: data.driversLicense || false,
        licenseCode: data.licenseCode || '',
      });
    }
  }, [personalInfo]); // Dependency on personalInfo from context

  // Listen for real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'personal-info') {
      console.log(
        '🔄 Real-time update received for personal info:',
        lastUpdate
      );
      console.log('🔄 Current personalInfo before refresh:', personalInfo);
      console.log('🔄 Last refresh timestamp:', lastRefreshTimestamp.current);
      console.log('🔄 Update timestamp:', lastUpdate.timestamp);

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
        await fetchPersonalInfo();
        setIsRefreshing(false);
      }, 500);
    }
  }, [lastUpdate]); // Dependency on lastUpdate from real-time context

  // Check for recent updates when component mounts or user changes
  useEffect(() => {
    if (user && hasRecentUpdate('personal-info', 2) && !isRefreshing) {
      // Check last 2 minutes
      console.log(
        '🔄 Recent update detected, checking if refresh is needed...'
      );

      // Only refresh if we don't have current data or if it's been more than 5 seconds since last refresh
      const shouldRefresh = !personalInfo || personalInfo.length === 0;

      if (shouldRefresh) {
        console.log('🔄 Refreshing data due to recent update...');
        setIsRefreshing(true);
        fetchPersonalInfo().finally(() => {
          setIsRefreshing(false);
        });
      } else {
        console.log('🔄 Skipping refresh - data is current');
      }
    }
  }, [user]); // Only depend on user changes, hasRecentUpdate is now stable

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length > 30) {
      newErrors.fullName = 'Full name must be 30 characters or less';
    }

    if (formData.idNumber && formData.idNumber.length > 13) {
      newErrors.idNumber = 'ID number must be 13 characters or less';
    }

    if (formData.ppNumber && formData.ppNumber.length > 20) {
      newErrors.ppNumber = 'Passport number must be 20 characters or less';
    }

    if (formData.licenseCode && formData.licenseCode.length > 10) {
      newErrors.licenseCode = 'License code must be 10 characters or less';
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
      clearErrors(); // Clear any previous context errors

      // Check if personal info already exists to determine whether to create or edit
      if (personalInfo && personalInfo.length > 0) {
        // Edit existing personal info
        const existingInfo = personalInfo[0];
        await editPersonalInfo({ id: existingInfo._id }, formData);
      } else {
        // Create new personal info
        await createPersonalInfo(formData);
      }

      // Check if there was an error from the context
      if (contextError) {
        setErrors({ submit: contextError });
      } else {
        setSuccessMessage('Personal information saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        // Refresh the context data after successful save
        fetchPersonalInfo();

        // Smooth scroll to top of the page
        const scrollToTop = () => {
          if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.scrollTo(0, 0);
          }
        };
        setTimeout(scrollToTop, 100);
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    }
  };

  const renderField = (
    name,
    label,
    type = 'text',
    placeholder = '',
    required = false,
    maxLength = null
  ) => (
    <div className="personal-info-form-field">
      <label htmlFor={name} className="personal-info-form-label">
        {label} {required && <span className="personal-info-required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`personal-info-form-input ${errors[name] ? 'personal-info-form-error' : ''}`}
        maxLength={maxLength}
      />
      {errors[name] && (
        <div className="personal-info-form-error-message">{errors[name]}</div>
      )}
    </div>
  );

  const renderSelectField = (name, label, options, required = false) => (
    <div className="personal-info-form-field">
      <label htmlFor={name} className="personal-info-form-label">
        {label} {required && <span className="personal-info-required">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`personal-info-form-input ${errors[name] ? 'personal-info-form-error' : ''}`}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <div className="personal-info-form-error-message">{errors[name]}</div>
      )}
    </div>
  );

  const renderCheckboxField = (name, label) => (
    <div className="personal-info-form-field checkbox-field">
      <label className="checkbox-label">
        <input
          type="checkbox"
          name={name}
          checked={formData[name]}
          onChange={handleInputChange}
          className="personal-info-form-checkbox"
        />
        <span className="checkbox-text">{label}</span>
      </label>
    </div>
  );

  if (contextLoading && !formData.fullName) {
    return <Loader message="Loading personal information..." />;
  }

  return (
    <div className="personal-info-form">
      <div className="personal-info-form-container" ref={formTopRef}>
        <div className="personal-info-form-header">
          <div className="personal-info-form-header-icon">👤</div>
          <div className="personal-info-form-header-content">
            <h2>Personal Information</h2>
            <p>Add your basic details and contact information</p>
            <div className="real-time-status">
              <span
                className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
              ></span>
              <span className="status-text">
                {isConnected ? 'Live updates enabled' : 'Connecting...'}
              </span>
              {isRefreshing && (
                <span className="refreshing-indicator">🔄 Refreshing...</span>
              )}
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  setIsRefreshing(true);
                  fetchPersonalInfo().finally(() => setIsRefreshing(false));
                }}
                className="manual-refresh-btn"
                title="Refresh data manually"
              >
                🔄
              </button>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="personal-info-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {errors.submit && (
          <div className="personal-info-form-error-message">
            <p>{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="personal-info-form-element">
          <div className="personal-info-form-section">
            <h3>Basic Information</h3>

            {renderField(
              'fullName',
              'Full Name',
              'text',
              'Enter your full name',
              true,
              30
            )}

            {renderField('dateOfBirth', 'Date of Birth', 'date', '', false)}

            {renderSelectField('gender', 'Gender', [
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ])}
          </div>

          <div className="personal-info-form-section">
            <h3>Identity Information</h3>

            {renderField(
              'idNumber',
              'ID Number',
              'text',
              'Enter your ID number',
              false,
              13
            )}

            {renderCheckboxField('saCitizen', 'I am a South African citizen')}

            {!formData.saCitizen && (
              <>
                {renderField(
                  'ppNumber',
                  'Passport Number',
                  'text',
                  'Enter your passport number',
                  false,
                  20
                )}
                {renderField(
                  'nationality',
                  'Nationality',
                  'text',
                  'Enter your nationality',
                  false
                )}
              </>
            )}
          </div>

          <div className="personal-info-form-section">
            <h3>Driver's License</h3>

            {renderCheckboxField('driversLicense', "I have a driver's license")}

            {formData.driversLicense &&
              renderSelectField('licenseCode', 'License Code', [
                { value: 'A1', label: 'A1 - Motorcycle' },
                { value: 'A', label: 'A - Motorcycle' },
                { value: 'B', label: 'B - Light motor vehicle' },
                { value: 'C1', label: 'C1 - Medium commercial vehicle' },
                { value: 'C', label: 'C - Heavy commercial vehicle' },
                { value: 'EB', label: 'EB - Light motor vehicle with trailer' },
                {
                  value: 'EC1',
                  label: 'EC1 - Medium commercial vehicle with trailer',
                },
                {
                  value: 'EC',
                  label: 'EC - Heavy commercial vehicle with trailer',
                },
              ])}
          </div>

          <div className="personal-info-form-actions">
            <button
              type="submit"
              className="personal-info-form-button primary"
              disabled={contextLoading}
            >
              {contextLoading ? 'Saving...' : 'Save Information'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInformationForm;
