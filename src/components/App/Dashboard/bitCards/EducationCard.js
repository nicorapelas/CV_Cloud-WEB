import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as SecondEduContext } from '../../../../context/SecondEduContext';

const EducationCard = ({ setNavTabSelected }) => {
  const {
    state: { secondEduStatus, loading, secondEduStatusInitFetchDone },
    fetchSecondEduStatus,
    setSecondEduStatusInitFetchDone,
  } = useContext(SecondEduContext);

  // Fetch secondary education status on component mount
  useEffect(() => {
    if (!secondEduStatusInitFetchDone) {
      fetchSecondEduStatus();
      setSecondEduStatusInitFetchDone(true);
    }
  }, [
    secondEduStatusInitFetchDone,
    fetchSecondEduStatus,
    setSecondEduStatusInitFetchDone,
  ]);

  const section = {
    id: 'education',
    title: 'Secondary Education',
    description: 'Include your academic background',
    icon: '🎓',
    route: '/app/cv-builder',
  };

  console.log('secondEduStatus', secondEduStatus);

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
        {secondEduStatus !== null && !loading && (
          <span className="status-indicator">
            {secondEduStatus === 0 ? (
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

export default EducationCard;
