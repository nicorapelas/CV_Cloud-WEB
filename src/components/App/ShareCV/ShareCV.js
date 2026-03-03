import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as ShareCVContext } from '../../../context/ShareCVContext';
import { Context as PhotoContext } from '../../../context/PhotoContext';
import { Context as PersonalInfoContext } from '../../../context/PersonalInfoContext';
import { Context as UniversalContext } from '../../../context/UniversalContext';
import { useRealTime } from '../../../context/RealTimeContext';
import { getInitials, getAvatarStyle } from '../../../utils/avatarUtils';
import Loader from '../../common/loader/Loader';
import './ShareCV.css';

const ShareCV = () => {
  const {
    state: { user },
    applyToIntro,
  } = useContext(AuthContext);

  const {
    state: { curriculumVitaeID },
    fetchCV_ID,
  } = useContext(UniversalContext);

  const {
    state: { assignedPhotoUrl },
    fetchAssignedPhoto,
  } = useContext(PhotoContext);

  const {
    state: { personalInfo },
    fetchPersonalInfo,
  } = useContext(PersonalInfoContext);

  const {
    state: { error, loading, cvTemplateSelected },
    createShareCV,
    clearShareCVErrors,
    addError,
  } = useContext(ShareCVContext);

  // Real-time context
  const { lastUpdate, hasRecentUpdate } = useRealTime();

  // Navigation
  const navigate = useNavigate();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    subject: 'CV Application - Professional Opportunity',
    message: '',
    email: '',
  });
  const [recipients, setRecipients] = useState([]);
  const [sentMessage, setSentMessage] = useState(false);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    };
    setTimeout(scrollToTop, 100);
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchAssignedPhoto();
      fetchCV_ID();
      fetchPersonalInfo();
    }
  }, [user, fetchAssignedPhoto, fetchCV_ID, fetchPersonalInfo]);

  // Update subject line and message when personal info loads
  useEffect(() => {
    if (personalInfo && personalInfo[0]?.fullName) {
      const fullName = personalInfo[0].fullName;
      const defaultMessage = `Dear Hiring Manager,

I am writing to express my interest in potential opportunities within your organization. Please find my CV attached for your review.

I would welcome the opportunity to discuss how my skills and experience could contribute to your team.

Thank you for your consideration.

Best regards,
${fullName}`;

      setFormData(prev => ({
        ...prev,
        subject: `CV Application - ${fullName}`,
        message: prev.message === '' ? defaultMessage : prev.message,
      }));
    }
  }, [personalInfo]);

  // Handle real-time updates
  useEffect(() => {
    if (hasRecentUpdate('shareCV')) {
      fetchAssignedPhoto();
      fetchCV_ID();
    }
  }, [lastUpdate, hasRecentUpdate, fetchAssignedPhoto, fetchCV_ID]);

  // Handle sent message timeout
  useEffect(() => {
    if (sentMessage) {
      const timer = setTimeout(() => {
        setSentMessage(false);
        resetForm();
        // Navigate the user to dashboard
        navigate('/app/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sentMessage, navigate]);

  // Reset form function
  const resetForm = () => {
    setFormData({
      subject: 'CV Application - Professional Opportunity',
      message: '',
      email: '',
    });
    setRecipients([]);
    setCurrentStep(1);
    setShowPreview(false);
    setSentMessage(false);
  };

  // Email validation
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error && error[name]) {
      clearShareCVErrors();
    }
  };

  // Add recipient
  const addRecipient = () => {
    const { email } = formData;

    if (!email || !email.trim()) {
      return;
    }

    if (!validateEmail(email)) {
      addError({ email: 'Please enter a valid email address' });
      return;
    }

    // Check for duplicates
    const isDuplicate = recipients.some(rec => rec.email === email);
    if (isDuplicate) {
      addError({ email: 'This email address is already added' });
      return;
    }

    // Add recipient
    const newRecipient = {
      email: email.trim(),
      key:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
    };

    setRecipients(prev => [...prev, newRecipient]);
    setFormData(prev => ({ ...prev, email: '' }));
    clearShareCVErrors();
  };

  // Remove recipient
  const removeRecipient = key => {
    setRecipients(prev => prev.filter(rec => rec.key !== key));
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    // Validate current step
    if (currentStep === 1) {
      if (!formData.subject.trim()) {
        addError({ subject: 'Subject is required' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.message.trim()) {
        addError({ message: 'Message is required' });
        return;
      }
      setCurrentStep(3); // Recipients step (photo step removed)
    } else if (currentStep === 3) {
      // If there's an email in the input field, automatically add it
      if (formData.email.trim() && validateEmail(formData.email.trim())) {
        const email = formData.email.trim();
        const isDuplicate = recipients.some(rec => rec.email === email);

        if (!isDuplicate) {
          const newRecipient = {
            email: email,
            key:
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15),
          };
          setRecipients(prev => [...prev, newRecipient]);
          setFormData(prev => ({ ...prev, email: '' }));
          clearShareCVErrors();
        }
      }

      // Check if we have at least one recipient (either already added or just added)
      const totalRecipients =
        recipients.length +
        (formData.email.trim() &&
        validateEmail(formData.email.trim()) &&
        !recipients.some(rec => rec.email === formData.email.trim())
          ? 1
          : 0);

      if (totalRecipients === 0 && recipients.length === 0) {
        addError({ recipients: 'At least one recipient is required' });
        return;
      }

      setShowPreview(true);
    }
  };

  // Handle back navigation within Share CV steps
  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3 && showPreview) {
      setShowPreview(false);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  // Handle back from Share CV page (header back button)
  const handleBackToPrevious = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/app/dashboard');
    }
  };

  // Send CV
  const sendCV = async () => {
    const shareData = {
      curriculumVitaeID,
      subject: formData.subject,
      message: formData.message,
      recipients: recipients,
      assignedPhotoUrl: assignedPhotoUrl ? assignedPhotoUrl : null,
      CVTemplate: cvTemplateSelected,
    };

    try {
      await createShareCV(shareData);
      setSentMessage(true);
      applyToIntro();
    } catch (error) {
      console.error('Error sending CV:', error);
    }
  };

  // Handle key press for email input
  const handleEmailKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient();
    }
  };

  if (loading) {
    return <Loader message="Loading..." />;
  }

  return (
    <div className="share-cv" ref={formTopRef}>
      <div className="share-cv-inner">
        <header className="share-cv-header">
          <div className="share-cv-header-left">
            <button type="button" onClick={handleBackToPrevious} className="share-cv-back">
              ← Back
            </button>
          </div>
          <div className="share-cv-header-center">
            <div className="share-cv-header-icon">📤</div>
            <div className="share-cv-header-content">
              <h1>Share CV</h1>
              <p>Send your CV to potential employers</p>
            </div>
          </div>
          <div className="share-cv-header-right"></div>
        </header>

        {/* Success Message */}
        {sentMessage && (
          <div className="share-cv-success">
            <div className="share-cv-success-content">
              <div className="share-cv-success-icon">✅</div>
              <h2>Your CV has been sent!</h2>
              <p>Good luck with your applications!</p>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="share-cv-errors">
            {Object.entries(error).map(([key, value]) => (
              <div key={key} className="share-cv-error-message">
                {value}
              </div>
            ))}
          </div>
        )}

        {/* Form Steps */}
        {!sentMessage && (
          <main className="share-cv-main">
            <div className="share-cv-container">
              <form onSubmit={handleSubmit} className="share-cv-form">
              {/* Step 1: Subject */}
              {currentStep === 1 && (
                <div className="share-cv-step">
                  <div className="share-cv-step-header">
                    <h2>Email Subject Line</h2>
                    <p>Enter a compelling subject line for your email</p>
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g., Application for Software Developer Position"
                      className="form-input"
                      autoFocus
                      maxLength={100}
                    />
                    <small className="form-help-text">
                      {formData.subject.length}/100 characters
                    </small>
                  </div>

                  <div className="share-cv-navigation">
                    <button type="submit" className="btn btn-primary">
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Message */}
              {currentStep === 2 && (
                <div className="share-cv-step">
                  <div className="share-cv-step-header">
                    <h2>Message</h2>
                    <p>Write a personalized message to accompany your CV</p>
                  </div>

                  <div className="form-group">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Dear Hiring Manager, I am writing to express my interest in the position..."
                      className="form-textarea"
                      rows={8}
                      autoFocus
                      maxLength={1000}
                    />
                    <small className="form-help-text">
                      {formData.message.length}/1000 characters
                    </small>
                  </div>

                  <div className="share-cv-navigation">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="btn btn-secondary"
                    >
                      ← Back
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Recipients */}
              {currentStep === 3 && !showPreview && (
                <div className="share-cv-step">
                  <div className="share-cv-step-header">
                    <h2>Recipients</h2>
                    <p>
                      Add email addresses of people you want to send your CV to
                    </p>
                  </div>

                  {/* Recipients List */}
                  {recipients.length > 0 && (
                    <div className="share-cv-recipients-list">
                      {recipients.map(recipient => (
                        <div
                          key={recipient.key}
                          className="share-cv-recipient-item"
                        >
                          <span className="recipient-email">
                            {recipient.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRecipient(recipient.key)}
                            className="recipient-remove"
                            title="Remove recipient"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="form-group">
                    <div className="input-group">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onKeyPress={handleEmailKeyPress}
                        placeholder="Enter email address"
                        className="form-input"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={addRecipient}
                        className="btn btn-outline"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="share-cv-navigation">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="btn btn-secondary"
                    >
                      ← Back
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Preview →
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Step */}
              {showPreview && currentStep === 3 && (
                <div className="share-cv-step">
                  <div className="share-cv-step-header">
                    <h2>Preview</h2>
                    <p>Review your email before sending</p>
                  </div>

                  <div className="share-cv-preview">
                    <div className="preview-photo">
                      {assignedPhotoUrl &&
                      assignedPhotoUrl !== 'noneAssigned' ? (
                        <img src={assignedPhotoUrl} alt="Profile" />
                      ) : (
                        <div
                          className="preview-photo-avatar"
                          style={getAvatarStyle(
                            personalInfo?.[0]?.fullName || user?.email,
                            120
                          )}
                        >
                          {getInitials(
                            personalInfo?.[0]?.fullName || user?.email
                          )}
                        </div>
                      )}
                    </div>

                    <div className="preview-section">
                      <h3>Subject:</h3>
                      <p>{formData.subject}</p>
                    </div>

                    <div className="preview-section">
                      <h3>Message:</h3>
                      <p>{formData.message}</p>
                    </div>

                    <div className="preview-section">
                      <h3>Recipients:</h3>
                      <ul>
                        {recipients.map(recipient => (
                          <li key={recipient.key}>{recipient.email}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="share-cv-navigation">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="btn btn-secondary"
                    >
                      ← Edit
                    </button>
                    <button
                      type="button"
                      onClick={sendCV}
                      className="btn btn-success"
                    >
                      📤 Send CV
                    </button>
                  </div>
                </div>
              )}
              </form>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default ShareCV;
