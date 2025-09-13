import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as InterestContext } from '../../../../context/InterestContext';

const InterestCard = ({ setNavTabSelected }) => {
  const {
    state: { interestStatus, loading, interestStatusInitFetchDone },
    fetchInterestStatus,
    setInterestStatusInitFetchDone,
  } = useContext(InterestContext);

  // Fetch interest status on component mount
  useEffect(() => {
    if (!interestStatusInitFetchDone) {
      fetchInterestStatus();
      setInterestStatusInitFetchDone(true);
    }
  }, [
    interestStatusInitFetchDone,
    fetchInterestStatus,
    setInterestStatusInitFetchDone,
  ]);

  const section = {
    id: 'interest',
    title: 'Interests',
    description: 'Add your personal interests and hobbies',
    icon: '🎯',
    route: '/app/cv-builder',
  };

  console.log('interestStatus', interestStatus);

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
        {interestStatus !== null && !loading && (
          <span className="status-indicator">
            {interestStatus === 0 ? (
              <span style={{ color: '#e74c3c' }}>● 0</span>
            ) : interestStatus === 1 ? (
              <span style={{ color: '#f39c12' }}>● 1</span>
            ) : interestStatus === 2 ? (
              <span style={{ color: '#f1c40f' }}>● 2</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>● {interestStatus}</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default InterestCard;
