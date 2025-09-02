import React from 'react';
import './Loader.css';

const Loader = ({ message = 'Loading...', show = true }) => {
  if (!show) return null;

  return (
    <div className="loader-page">
      <div className="loader-container">
        <div className="loader-content">
          <div className="loader-logo">
            <img
              src="/icon-512.png"
              alt="CV Cloud Logo"
              className="loader-logo-image"
            />
          </div>

          <div className="loader-message-section">
            <h2 className="loader-title">{message}</h2>
            <p className="loader-subtitle">
              Please wait while we process your request
            </p>
          </div>

          <div className="bouncing-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
