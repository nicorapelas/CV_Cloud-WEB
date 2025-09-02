import React, { useState, useContext, useEffect } from 'react';
import { Context as FirstImpressionContext } from '../../../../context/FirstImpressionContext';
import FirstImpressionFileUpload from './FirstImpressionFileUpload';
import FirstImpressionRecordUpload from './FirstImpressionRecordUpload';
import FirstImpressionViewOrRemove from './FirstImpressionViewOrRemove';
import './FirstImpression.css';

const FirstImpressionSourceSelector = () => {
  const [selectedSource, setSelectedSource] = useState(null);

  const {
    state: { firstImpression, loading },
    fetchFirstImpression,
  } = useContext(FirstImpressionContext);

  useEffect(() => {
    fetchFirstImpression();
  }, []);

  const handleSourceSelect = source => {
    setSelectedSource(source);
  };

  const handleBackToSelector = () => {
    setSelectedSource(null);
  };

  // Check if a first impression video already exists
  const hasExistingVideo = firstImpression && firstImpression.videoUrl;

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="first-impression-container">
        <div className="upload-progress-container">
          <div className="upload-progress-content">
            <div className="upload-spinner">⏳</div>
            <h3>Loading...</h3>
            <p>Checking your first impression video status</p>
          </div>
        </div>
      </div>
    );
  }

  // If there's an existing video, show the view/remove component
  if (hasExistingVideo) {
    return <FirstImpressionViewOrRemove />;
  }

  // Render the appropriate component based on selection
  if (selectedSource === 'upload') {
    return (
      <div className="first-impression-container">
        <div className="source-header">
          <button onClick={handleBackToSelector} className="back-button">
            ← Back to Options
          </button>
          <h2>Upload Video File</h2>
        </div>
        <FirstImpressionFileUpload />
      </div>
    );
  }

  if (selectedSource === 'record') {
    return (
      <div className="first-impression-container">
        <div className="source-header">
          <button onClick={handleBackToSelector} className="back-button">
            ← Back to Options
          </button>
          <h2>Record New Video</h2>
        </div>
        <FirstImpressionRecordUpload />
      </div>
    );
  }

  // Main selector view
  return (
    <div className="first-impression-container">
      <div className="source-selector">
        <div className="selector-header">
          <h2>Create Your First Impression</h2>
          <p>Choose how you'd like to add your video introduction</p>
        </div>

        <div className="source-options">
          <div
            className="source-option"
            onClick={() => handleSourceSelect('upload')}
          >
            <div className="option-icon">📁</div>
            <div className="option-content">
              <h3>Upload Video File</h3>
              <p>Select an existing video file from your device</p>
              <ul className="option-features">
                <li>• Supports MP4, MOV, AVI, and more</li>
                <li>• Quick and easy upload</li>
                <li>• Use videos you've already recorded</li>
              </ul>
            </div>
            <div className="option-arrow">→</div>
          </div>

          <div
            className="source-option"
            onClick={() => handleSourceSelect('record')}
          >
            <div className="option-icon">🎥</div>
            <div className="option-content">
              <h3>Record New Video</h3>
              <p>Record a video directly using your webcam</p>
              <ul className="option-features">
                <li>• Record with your camera and microphone</li>
                <li>• Preview before uploading</li>
                <li>• Retake if needed</li>
              </ul>
            </div>
            <div className="option-arrow">→</div>
          </div>
        </div>

        <div className="selector-info">
          <div className="info-box">
            <h4>💡 What is a First Impression?</h4>
            <p>
              A First Impression video is a short introduction that helps
              potential employers get to know you better. It's your chance to
              showcase your personality, communication skills, and enthusiasm
              for opportunities.
            </p>
          </div>

          <div className="info-box">
            <h4>📋 Tips for a Great First Impression</h4>
            <ul>
              <li>Keep it brief (30-60 seconds recommended)</li>
              <li>Speak clearly and confidently</li>
              <li>Dress professionally</li>
              <li>Choose a quiet, well-lit environment</li>
              <li>Practice your introduction beforehand</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstImpressionSourceSelector;
