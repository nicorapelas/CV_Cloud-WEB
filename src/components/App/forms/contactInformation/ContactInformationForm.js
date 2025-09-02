import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as ContactInfoContext } from '../../../../context/ContactInfoContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import Loader from '../../../common/loader/Loader';
import './ContactInformationForm.css';

const ContactInformationForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);

  const {
    state: { contactInfo, loading: contextLoading, error: contextError },
    fetchContactInfo,
    createContactInfo,
    editContactInfo,
    clearErrors,
  } = useContext(ContactInfoContext);

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

  // Form state
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    unit: '',
    complex: '',
    address: '',
    suburb: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
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
    console.log('contactInfo', contactInfo);
    if (contactInfo && contactInfo.length > 0) {
      const data = contactInfo[0];
      setFormData({
        phone: data.phone || '',
        email: data.email || '',
        unit: data.unit || '',
        complex: data.complex || '',
        address: data.address || '',
        suburb: data.suburb || '',
        city: data.city || '',
        province: data.province || '',
        country: data.country || '',
        postalCode: data.postalCode || '',
      });
    }
  }, [contactInfo]); // Dependency on contactInfo from context

  // Listen for real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'contact-info') {
      console.log('🔄 Real-time update received for contact info:', lastUpdate);
      console.log('🔄 Current contactInfo before refresh:', contactInfo);

      setIsRefreshing(true);

      // Add a small delay to ensure the server has processed the update
      setTimeout(async () => {
        await fetchContactInfo();
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must be 100 characters or less';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be 20 characters or less';
    }

    if (formData.address && formData.address.length > 200) {
      newErrors.address = 'Address must be 200 characters or less';
    }

    if (formData.city && formData.city.length > 50) {
      newErrors.city = 'City must be 50 characters or less';
    }

    if (formData.postalCode && formData.postalCode.length > 10) {
      newErrors.postalCode = 'Postal code must be 10 characters or less';
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

      // Check if contact info already exists to determine whether to create or edit
      if (contactInfo && contactInfo.length > 0) {
        // Edit existing contact info
        const existingInfo = contactInfo[0];
        await editContactInfo({ id: existingInfo._id }, formData);
      } else {
        // Create new contact info
        await createContactInfo(formData);
      }

      // Check if there was an error from the context
      if (!contextError) {
        setSuccessMessage('Contact information saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      setErrors({
        submit: 'Failed to save contact information. Please try again.',
      });
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
    <div className="contact-info-form-field">
      <label htmlFor={name} className="contact-info-form-label">
        {label} {required && <span className="contact-info-required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`contact-info-form-input ${errors[name] ? 'contact-info-form-error' : ''}`}
        maxLength={maxLength}
      />
      {errors[name] && (
        <div className="contact-info-form-error-message">{errors[name]}</div>
      )}
    </div>
  );

  if (contextLoading && !formData.email) {
    return <Loader message="Loading contact information..." />;
  }

  return (
    <div className="contact-info-form">
      <div className="contact-info-form-container" ref={formTopRef}>
        <div className="contact-info-form-header">
          <div className="contact-info-form-header-icon">📞</div>
          <div className="contact-info-form-header-content">
            <h2>Contact Information</h2>
            <p>Manage your contact details and social links</p>
          </div>
        </div>

        {successMessage && (
          <div className="contact-info-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {errors.submit && (
          <div className="contact-info-form-error-message">
            <p>{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="contact-info-form-element">
          <div className="contact-info-form-section">
            <h3>Primary Contact</h3>

            {renderField(
              'email',
              'Email Address',
              'email',
              'Enter your email address',
              true
            )}

            {renderField(
              'phone',
              'Phone Number',
              'tel',
              'Enter your phone number',
              true,
              14
            )}
          </div>

          <div className="contact-info-form-section">
            <h3>Address Information</h3>

            <div className="contact-info-form-row">
              <div className="contact-info-form-col">
                {renderField('unit', 'Unit Number', 'text', 'Unit/Flat number')}
              </div>
              <div className="contact-info-form-col">
                {renderField(
                  'complex',
                  'Complex Name',
                  'text',
                  'Complex/Building name'
                )}
              </div>
            </div>

            {renderField(
              'address',
              'Street Address',
              'text',
              'Enter your street address'
            )}

            <div className="contact-info-form-row">
              <div className="contact-info-form-col">
                {renderField('suburb', 'Suburb', 'text', 'Suburb/Neighborhood')}
              </div>
              <div className="contact-info-form-col">
                {renderField('city', 'City', 'text', 'City')}
              </div>
            </div>

            <div className="contact-info-form-row">
              <div className="contact-info-form-col">
                {renderField(
                  'province',
                  'Province/State',
                  'text',
                  'Province or State'
                )}
              </div>
              <div className="contact-info-form-col">
                {renderField('country', 'Country', 'text', 'Country')}
              </div>
            </div>

            {renderField(
              'postalCode',
              'Postal Code',
              'text',
              'Postal/ZIP code',
              false,
              10
            )}
          </div>

          <div className="contact-info-form-actions">
            <button
              type="submit"
              className="contact-info-form-button primary"
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

export default ContactInformationForm;
