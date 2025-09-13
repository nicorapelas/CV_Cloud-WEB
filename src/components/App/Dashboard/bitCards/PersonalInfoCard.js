import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as PersonalInfoContext } from '../../../../context/PersonalInfoContext';

const PersonalInfoCard = ({ setNavTabSelected }) => {
  const {
    state: { personalInfoStatus, loading, personalInfoStatusFetchDone },
    fetchPersonalInfoStatus,
    setPersonalInfoStatusFetchDone,
  } = useContext(PersonalInfoContext);

  // Fetch personal info status on component mount
  useEffect(() => {
    if (!personalInfoStatusFetchDone) {
      fetchPersonalInfoStatus();
      setPersonalInfoStatusFetchDone(true);
    }
  }, [
    personalInfoStatusFetchDone,
    fetchPersonalInfoStatus,
    setPersonalInfoStatusFetchDone,
  ]);

  const section = {
    id: 'personalInfo',
    title: 'Personal Information',
    description: 'Add your basic details and contact information',
    icon: '👤',
    route: '/app/cv-builder',
  };

  console.log('personalInfoStatus', personalInfoStatus);

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
        {personalInfoStatus !== null && !loading && (
          <span className="status-indicator">
            {personalInfoStatus === null || personalInfoStatus < 1 ? (
              <span style={{ color: '#e74c3c' }}>● {personalInfoStatus}%</span>
            ) : personalInfoStatus > 1 && personalInfoStatus < 35 ? (
              <span style={{ color: '#f39c12' }}>● {personalInfoStatus}%</span>
            ) : personalInfoStatus > 49 && personalInfoStatus < 68 ? (
              <span style={{ color: '#f1c40f' }}>● {personalInfoStatus}%</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>● {personalInfoStatus}%</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default PersonalInfoCard;
