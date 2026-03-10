import React, { useContext, useEffect, useState } from 'react';
import { Context as PublicCVContext } from '../../../../context/PublicCVContext';
import { Context as ShareCVContext } from '../../../../context/ShareCVContext';
import socketService from '../../../../services/socketService';
import IndustrySelectionModal from '../../../common/IndustrySelectionModal/IndustrySelectionModal';
import {
  trackCVPublished,
  trackCVUnpublished,
} from '../../../../utils/activityTracker';
import './CVVisibilityCard.css';

const CVVisibilityCard = () => {
  const {
    state: { isListed, publicCV, loading, error },
    fetchPublicCVStatus,
    togglePublicCV,
    clearError,
  } = useContext(PublicCVContext);

  const {
    state: { cvTemplateSelected },
  } = useContext(ShareCVContext);

  const [isToggling, setIsToggling] = useState(false);
  const [liveViewNotification, setLiveViewNotification] = useState(null);
  const [showIndustryModal, setShowIndustryModal] = useState(false);

  // Fetch status on component mount
  useEffect(() => {
    fetchPublicCVStatus();
  }, [fetchPublicCVStatus]);

  // Listen for real-time view notifications
  useEffect(() => {
    const handlePublicCVViewed = data => {
      console.log('🔔 Public CV viewed notification:', data);

      // Show notification
      setLiveViewNotification({
        hrUserName: data.hrUserName,
        viewedAt: data.viewedAt,
      });

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setLiveViewNotification(null);
      }, 5000);

      // Refresh status to get updated view count
      fetchPublicCVStatus();
    };

    // Add event listener
    socketService.addEventListener('public-cv-viewed', handlePublicCVViewed);

    // Cleanup
    return () => {
      socketService.removeEventListener(
        'public-cv-viewed',
        handlePublicCVViewed
      );
    };
  }, [fetchPublicCVStatus]);

  const handleToggle = async () => {
    // If turning ON (going public), show industry selection modal
    if (!isListed) {
      setShowIndustryModal(true);
      return;
    }

    // If turning OFF (going private), toggle directly
    setIsToggling(true);
    try {
      await togglePublicCV([], cvTemplateSelected || 'template01');
      // Track activity
      trackCVUnpublished();
    } catch (err) {
      console.error('Error toggling visibility:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleIndustryConfirm = async industries => {
    setShowIndustryModal(false);
    setIsToggling(true);
    try {
      await togglePublicCV(industries, cvTemplateSelected || 'template01');
      // Track activity
      trackCVPublished();
    } catch (err) {
      console.error('Error toggling visibility:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleIndustryCancel = () => {
    setShowIndustryModal(false);
  };

  return (
    <div className="cv-visibility-card">
      {/* Live View Notification */}
      {liveViewNotification && (
        <div className="live-view-notification">
          <span className="notification-icon">👁️</span>
          <span className="notification-text">
            <strong>{liveViewNotification.hrUserName}</strong> just viewed your
            CV!
          </span>
        </div>
      )}

      <div className="cv-visibility-header">
        <div className="cv-visibility-icon">🌐</div>
        <div className="cv-visibility-title">
          <h4>CV Visibility Settings</h4>
          <p className="cv-visibility-subtitle">
            {isListed
              ? 'Your CV is discoverable by HR professionals'
              : 'Make your CV discoverable to HR professionals'}
          </p>
        </div>
      </div>

      <div className="cv-visibility-content">
        <div className="cv-visibility-toggle-section">
          <div className="toggle-info">
            <span className="toggle-label">
              {isListed ? '✓ Listed Publicly' : 'Not Listed'}
            </span>
            <p className="toggle-description">
              {isListed
                ? 'HR users can find and save your CV'
                : 'Enable to let HR professionals discover your CV'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading || isToggling}
            className={`visibility-toggle-button ${isListed ? 'active' : ''}`}
          >
            {isToggling ? (
              <span className="toggle-spinner">⟳</span>
            ) : isListed ? (
              'TURN OFF'
            ) : (
              'TURN ON'
            )}
          </button>
        </div>

        {/* Stats Section */}
        {isListed && publicCV && (publicCV.saveCount ?? publicCV.viewCount ?? 0) > 0 && (
          <div className="cv-visibility-stats">
            <div className="visibility-stat">
              <span className="stat-icon">💾</span>
              <span className="stat-value">{publicCV.saveCount ?? publicCV.viewCount}</span>
              <span className="stat-label">
                {(publicCV.saveCount ?? publicCV.viewCount) === 1 ? 'Time saved' : 'Times saved'}
              </span>
              <span className="stat-description">Each time an HR saved your CV</span>
            </div>
            {publicCV.hrViews && publicCV.hrViews.length > 0 && (
              <div className="visibility-stat">
                <span className="stat-icon">👥</span>
                <span className="stat-value">{publicCV.hrViews.length}</span>
                <span className="stat-label">
                  {publicCV.hrViews.length === 1
                    ? 'Unique HR professional'
                    : 'Unique HR professionals'}
                </span>
                <span className="stat-description">Different people who saved your CV</span>
              </div>
            )}
          </div>
        )}

        {/* Recent HR Views */}
        {isListed &&
          publicCV &&
          publicCV.hrViews &&
          publicCV.hrViews.length > 0 && (
            <div className="cv-visibility-recent-views">
              <h5 className="recent-views-title">Recent Views:</h5>
              <div className="recent-views-list">
                {publicCV.hrViews.map((view, index) => {
                  const viewDate = new Date(view.viewedAt);
                  const formattedDate = viewDate.toLocaleDateString();
                  const formattedTime = viewDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div key={index} className="recent-view-item">
                      <span className="view-name">
                        {view.hrUserName || 'HR Professional'}
                      </span>
                      <span className="view-date">
                        {formattedDate} {formattedTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Error Display */}
        {error && (
          <div className="cv-visibility-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button onClick={clearError} className="error-close">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Industry Selection Modal */}
      <IndustrySelectionModal
        isOpen={showIndustryModal}
        onClose={handleIndustryCancel}
        onConfirm={handleIndustryConfirm}
        initialIndustries={publicCV?.industries || []}
      />
    </div>
  );
};

export default CVVisibilityCard;
