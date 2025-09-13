import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as PhotoContext } from '../../../../context/PhotoContext';

const PhotoCard = ({ setNavTabSelected }) => {
  const {
    state: { photoStatus, loading, photoStatusInitFetchDone },
    fetchPhotoStatus,
    setPhotoStatusInitFetchDone,
  } = useContext(PhotoContext);

  // Fetch photo status on component mount
  useEffect(() => {
    if (!photoStatusInitFetchDone) {
      fetchPhotoStatus();
      setPhotoStatusInitFetchDone(true);
    }
  }, [photoStatusInitFetchDone, fetchPhotoStatus, setPhotoStatusInitFetchDone]);

  const section = {
    id: 'photo',
    title: 'Profile Photo',
    description: 'Add a professional photo',
    icon: '📸',
    route: '/app/cv-builder',
  };

  console.log('photoStatus', photoStatus);

  return (
    <Link
      to={section.route}
      className="dashboard-section-card"
      onClick={() => setNavTabSelected(section.id)}
    >
      <div className="dashboard-section-icon">{section.icon}</div>
      <div className="dashboard-section-content">
        <h4>{section.title}</h4>
        <p>{section.description}</p>
        {loading && <span className="loading-indicator">Loading...</span>}
        {photoStatus !== null && !loading && (
          <span className="status-indicator">
            {photoStatus === 0 ? (
              <span style={{ color: '#e74c3c' }}>○ Incomplete</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>✓ Complete</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default PhotoCard;
