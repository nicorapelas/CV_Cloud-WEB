import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as FirstImpressionContext } from '../../../../context/FirstImpressionContext';

const FirstImpressionCard = ({ setNavTabSelected }) => {
  console.log('🎥 FirstImpressionCard component loaded');

  const {
    state: {
      videoDemoShow,
      videoDemoUrl,
      firstImpressionStatus,
      loading,
      firstImpressionStatusInitFetchDone,
    },
    fetchDemoVideoUrl,
    fetchFirsImpressionStatus,
    setFirstImpressionStatusInitFetchDone,
  } = useContext(FirstImpressionContext);

  useEffect(() => {
    fetchDemoVideoUrl();
  }, [fetchDemoVideoUrl]);

  // Fetch first impression status on component mount
  useEffect(() => {
    if (!firstImpressionStatusInitFetchDone) {
      fetchFirsImpressionStatus();
      setFirstImpressionStatusInitFetchDone(true);
    }
  }, [
    firstImpressionStatusInitFetchDone,
    fetchFirsImpressionStatus,
    setFirstImpressionStatusInitFetchDone,
  ]);

  const handleDemoClick = () => {
    console.log('🎬 Watch Demo button clicked!');
    console.log('📍 Current location:', window.location.href);
    console.log('🎯 Opening demo video...');

    // Open demo video directly
    if (videoDemoUrl && videoDemoUrl.url) {
      window.open(videoDemoUrl.url, '_blank');
    } else {
      console.log('❌ No demo video URL available');
    }

    console.log('✅ Demo video opened');
  };

  const section = {
    id: 'firstImpression',
    title: 'First Impression',
    description:
      'Create a compelling video introduction that makes you stand out',
    icon: '🎥',
    route: '/app/cv-builder',
    isHero: true,
  };

  console.log('FirstImpression Debug:', {
    firstImpressionStatus,
    loading,
    statusType: typeof firstImpressionStatus,
    isComplete: firstImpressionStatus > 0,
    isIncomplete: firstImpressionStatus === 0,
    videoDemoUrl,
    hasVideoDemoUrl: !!videoDemoUrl,
  });

  return (
    <div className="dashboard-hero-section">
      <Link
        to={section.route}
        className="dashboard-hero-card"
        onClick={() => setNavTabSelected(section.id)}
      >
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-icon">{section.icon}</div>
          <div className="dashboard-hero-text">
            <h2 className="dashboard-hero-title">{section.title}</h2>
            <p className="dashboard-hero-description">{section.description}</p>
            {firstImpressionStatus !== null &&
            !loading &&
            Number(firstImpressionStatus) > 0 ? (
              <div className="dashboard-hero-badge">
                <span
                  style={{
                    color: '#2ecc71',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                  }}
                >
                  ✓ Complete
                </span>
              </div>
            ) : (
              <div className="dashboard-hero-badge">
                <span>Watch a demo, on how it's done</span>

                {/* Test button - always visible */}
                <button
                  onClick={e => {
                    console.log('🧪 TEST button clicked!');
                    e.preventDefault();
                    e.stopPropagation();
                    handleDemoClick();
                  }}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    margin: '5px',
                  }}
                >
                  🧪 TEST Demo
                </button>

                {videoDemoUrl && (
                  <button
                    onClick={e => {
                      console.log('🖱️ Demo button clicked!');
                      e.preventDefault();
                      e.stopPropagation();
                      handleDemoClick();
                    }}
                    className="demo-watch-button"
                    style={{
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      margin: '5px',
                    }}
                  >
                    🎬 Watch Demo
                  </button>
                )}
                {loading && (
                  <span className="loading-indicator">Loading...</span>
                )}
                {firstImpressionStatus !== null &&
                  !loading &&
                  Number(firstImpressionStatus) === 0 && (
                    <span className="status-indicator">
                      <span style={{ color: '#e74c3c' }}>○ Incomplete</span>
                    </span>
                  )}
              </div>
            )}
          </div>
          <div className="dashboard-hero-arrow">→</div>
        </div>
      </Link>
    </div>
  );
};

export default FirstImpressionCard;
