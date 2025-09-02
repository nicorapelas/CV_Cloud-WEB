import React from 'react';
import { Link } from 'react-router-dom';
import './ShareCV.css';

const ShareCV = () => {
  return (
    <div className="share-cv">
      <header className="share-cv-header">
        <div className="share-cv-header-content">
          <Link to="/app/dashboard" className="share-cv-back">
            ← Back to Dashboard
          </Link>
          <h1>Share CV</h1>
        </div>
      </header>

      <main className="share-cv-main">
        <div className="share-cv-container">
          <div className="share-cv-content">
            <h2>Share CV Coming Soon</h2>
            <p>
              This section will allow you to share your CV with potential
              employers and colleagues.
            </p>
            <p>Features will include:</p>
            <ul>
              <li>Email sharing functionality</li>
              <li>Custom message templates</li>
              <li>Multiple recipient support</li>
              <li>Share tracking</li>
              <li>Direct link sharing</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShareCV;
