import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as ExperienceContext } from '../../../../context/ExperienceContext';

const ExperienceCard = ({ setNavTabSelected }) => {
  const {
    state: { experienceStatus, loading, experienceStatusInitFetchDone },
    fetchExperienceStatus,
    setExperienceStatusInitFetchDone,
  } = useContext(ExperienceContext);

  // Fetch experience status on component mount
  useEffect(() => {
    if (!experienceStatusInitFetchDone) {
      fetchExperienceStatus();
      setExperienceStatusInitFetchDone(true);
    }
  }, [
    experienceStatusInitFetchDone,
    fetchExperienceStatus,
    setExperienceStatusInitFetchDone,
  ]);

  const section = {
    id: 'experience',
    title: 'Work Experience',
    description: 'Add your professional work history',
    icon: '💼',
    route: '/app/cv-builder',
  };

  console.log('experienceStatus', experienceStatus);

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
        {experienceStatus !== null && !loading && (
          <span className="status-indicator">
            {experienceStatus === 0 ? (
              <span style={{ color: '#e74c3c' }}>● 0</span>
            ) : experienceStatus === 1 ? (
              <span style={{ color: '#f39c12' }}>● 1</span>
            ) : experienceStatus === 2 ? (
              <span style={{ color: '#f1c40f' }}>● 2</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>● {experienceStatus}</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default ExperienceCard;
