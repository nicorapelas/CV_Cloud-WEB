import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as SaveCVContext } from '../../../context/SaveCVContext';
import Loader from '../../common/loader/Loader';
import TermsAndConditionsModal from '../../common/TermsAndConditionsModal/TermsAndConditionsModal';
import './Signup.css';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref') || searchParams.get('introAffiliateCode') || '';
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    password2: '',
    introAffiliateCode: refFromUrl.trim(),
    HRIntent: false,
    website: '', // Honeypot field
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const {
    state: { loading, errorMessage, apiMessage, HRIntent },
    register,
    clearErrorMessage,
    clearApiMessage,
  } = useContext(AuthContext);

  const {
    state: { cvToSave },
  } = useContext(SaveCVContext);

  useEffect(() => {
    if (HRIntent) {
      setFormData(prev => ({
        ...prev,
        HRIntent,
      }));
      if (cvToSave) {
        setFormData(prev => ({
          ...prev,
          cvToSave,
        }));
      }
    }
  }, [HRIntent, cvToSave]);

  // Auto scroll to top when error or success messages appear
  useEffect(() => {
    if (errorMessage || apiMessage || localError) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [errorMessage, apiMessage, localError]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) clearErrorMessage();
    if (localError) setLocalError(''); // Clear local error when user types
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;

    // Honeypot check - if filled, it's likely a bot
    if (formData.website) {
      console.log('Bot detected - honeypot field filled');
      return; // Silently reject
    }

    // Check if terms are accepted
    if (!termsAccepted) {
      setShowTermsModal(true);
      return;
    }

    // Basic validation
    if (formData.password !== formData.password2) {
      // Handle password mismatch with local error state
      setLocalError('Passwords do not match');
      return;
    }

    // Clear messages only right before submitting
    clearApiMessage();
    clearErrorMessage();
    setLocalError(''); // Clear local error before submitting
    await register({ ...formData, termsAccepted });
  };

  const handleTermsAccept = accepted => {
    setTermsAccepted(accepted);
    setShowTermsModal(false);
  };

  const handleTermsClose = () => {
    setShowTermsModal(false);
  };

  const handleCheckboxClick = () => {
    setShowTermsModal(true);
  };

  const renderErrorMessage = () => {
    // Show local error first, then context error
    if (localError) {
      return (
        <div className="signup-error">
          <p>{localError}</p>
        </div>
      );
    }
    
    if (!errorMessage) return null;

    // Handle different error message formats
    if (typeof errorMessage === 'string') {
      return (
        <div className="signup-error">
          <p>{errorMessage}</p>
        </div>
      );
    }

    if (typeof errorMessage === 'object') {
      const { fullName, email, password, password2, general, terms, introAffiliateCode: introCodeError } =
        errorMessage;
      return (
        <div className="signup-error">
          {fullName && <p>{fullName}</p>}
          {email && <p>{email}</p>}
          {password && <p>{password}</p>}
          {password2 && <p>{password2}</p>}
          {terms && <p>{terms}</p>}
          {introCodeError && <p>{introCodeError}</p>}
          {general && <p>{general}</p>}
          {!fullName &&
            !email &&
            !password &&
            !password2 &&
            !general &&
            !terms &&
            !introCodeError && <p>{Object.values(errorMessage)[0]}</p>}
        </div>
      );
    }

    return null;
  };

  const renderApiMessage = () => {
    if (!apiMessage) return null;
    const { success } = apiMessage;
    if (!success) return null;
    return (
      <div className="signup-success">
        <p>{success}</p>
      </div>
    );
  };

  const handleNavToLogin = () => {
    clearErrorMessage();
    clearApiMessage();
    navigate('/login');
  };

  return (
    <>
      {loading ? (
        <Loader show={true} message="Creating your account..." />
      ) : (
        <div className="signup-page">
          <div className="signup-container">
            <div className="signup-card">
              <div className="signup-header">
                <div className="signup-logo">
                  <img
                    src="/icon-512.png"
                    alt="CV Cloud Icon"
                    className="signup-logo-image"
                    onClick={() => navigate('/')}
                  />
                </div>
                <h1>Create Account</h1>
                <p>Join CV Cloud and start building your professional CV</p>
              </div>

              <form onSubmit={handleSubmit} className="signup-form">
                {renderErrorMessage()}
                {renderApiMessage()}

                {/* Hide form fields if registration was successful */}
                {apiMessage && apiMessage.success ? (
                  <div className="signup-success-actions">
                    <p>
                      Please check your email and click the verification link to
                      activate your account.
                    </p>
                    <button
                      type="button"
                      onClick={handleNavToLogin}
                      className="signup-nav-to-login-button"
                    >
                      Go to Login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="signup-form-group">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="signup-input"
                      />
                    </div>

                    <div className="signup-form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="signup-input"
                      />
                    </div>

                    <div className="signup-form-group">
                      <label htmlFor="password">Password</label>
                      <div className="signup-password-container">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          required
                          className="signup-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="signup-password-toggle"
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </div>

                    <div className="signup-form-group">
                      <label htmlFor="password2">Confirm Password</label>
                      <div className="signup-password-container">
                        <input
                          type={showPassword2 ? 'text' : 'password'}
                          id="password2"
                          name="password2"
                          value={formData.password2}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          required
                          className="signup-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword2(!showPassword2)}
                          className="signup-password-toggle"
                        >
                          {showPassword2 ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </div>

                    <div className="signup-form-group">
                      <label htmlFor="introAffiliateCode">
                        Affiliate Code (Optional)
                      </label>
                      <input
                        type="text"
                        id="introAffiliateCode"
                        name="introAffiliateCode"
                        value={formData.introAffiliateCode}
                        onChange={handleChange}
                        placeholder="Enter affiliate code if you have one"
                        className="signup-input"
                      />
                    </div>

                    {/* Honeypot field - hidden from users, visible to bots */}
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      tabIndex="-1"
                      autoComplete="off"
                      style={{
                        position: 'absolute',
                        left: '-9999px',
                        width: '1px',
                        height: '1px',
                      }}
                      aria-hidden="true"
                    />

                    <div className="signup-terms-section">
                      <label className="signup-terms-checkbox-label">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={handleCheckboxClick}
                          className="signup-terms-checkbox"
                        />
                        <span className="signup-terms-text">
                          By creating an account, you agree to our{' '}
                          <span
                            className="signup-terms-link"
                            onClick={e => {
                              e.preventDefault();
                              setShowTermsModal(true);
                            }}
                          >
                            Terms and Conditions
                          </span>
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !formData.fullName ||
                        !formData.email ||
                        !formData.password ||
                        !formData.password2 ||
                        !termsAccepted
                      }
                      className="signup-submit-button"
                    >
                      Create Account
                    </button>
                  </>
                )}
              </form>

              {!apiMessage?.success && (
                <div className="signup-footer">
                  <p>
                    Already have an account?{' '}
                    <span onClick={handleNavToLogin} className="signup-link">
                      Sign in here
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={handleTermsClose}
        onAccept={handleTermsAccept}
        currentlyAccepted={termsAccepted}
      />
    </>
  );
};

export default Signup;
