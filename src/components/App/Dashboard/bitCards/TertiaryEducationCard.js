import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as TertEduContext } from '../../../../context/TertEduContext';

const TertiaryEducationCard = ({ setNavTabSelected }) => {
  const {
    state: { tertEduStatus, loading, tertEduStatusInitFetchDone },
    fetchTertEduStatus,
    setTertEduStatusInitFetchDone,
  } = useContext(TertEduContext);

  // Fetch tertiary education status on component mount
  useEffect(() => {
    if (!tertEduStatusInitFetchDone) {
      fetchTertEduStatus();
      setTertEduStatusInitFetchDone(true);
    }
  }, [
    tertEduStatusInitFetchDone,
    fetchTertEduStatus,
    setTertEduStatusInitFetchDone,
  ]);

  const section = {
    id: 'tertiaryEducation',
    title: 'Tertiary Education',
    description: 'Add your higher education qualifications',
    icon: '🎓',
    route: '/app/cv-builder',
  };

  console.log('tertEduStatus', tertEduStatus);

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
        {tertEduStatus !== null && !loading && (
          <span className="status-indicator">
            {tertEduStatus === 0 ? (
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

export default TertiaryEducationCard;
