import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import Loader from '../../common/loader/Loader';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    state: { loading, errorMessage, apiMessage, token, user },
    signin,
    clearErrorMessage,
    clearApiMessage,
  } = useContext(AuthContext);

  useEffect(() => {
    // Clear any existing messages when component mounts
    clearErrorMessage();
    clearApiMessage();
  }, []); // Empty dependency array - only run once on mount

  // Watch for successful authentication and redirect
  useEffect(() => {
    if (token || user) {
      navigate('/app/dashboard');
    }
  }, [token, user, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password || loading) {
      return;
    }

    await signin({ email, password });
  };

  const handleEmailChange = e => {
    setEmail(e.target.value);
    if (errorMessage) clearErrorMessage();
  };

  const handlePasswordChange = e => {
    setPassword(e.target.value);
    if (errorMessage) clearErrorMessage();
  };

  const renderErrorMessage = () => {
    if (!errorMessage) return null;

    return (
      <div className="login-error">
        <p>{errorMessage}</p>
      </div>
    );
  };

  const renderApiMessage = () => {
    if (!apiMessage) return null;

    return (
      <div className="login-success">
        <p>{apiMessage}</p>
      </div>
    );
  };

  return (
    <>
      <Loader show={loading} message="Signing you in..." />
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <img
                  src="/icon-512.png"
                  alt="CV Cloud Icon"
                  className="login-logo-image"
                />
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your CV Cloud account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {renderErrorMessage()}
              {renderApiMessage()}

              <div className="login-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  required
                  className="login-input"
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="password">Password</label>
                <div className="login-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    required
                    className="login-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-password-toggle"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="login-submit-button"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="login-link">
                  Sign up here
                </Link>
              </p>
              <Link to="/forgot-password" className="login-link">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
