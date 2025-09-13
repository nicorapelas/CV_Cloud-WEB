import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as ReferenceContext } from '../../../../context/ReferenceContext';

const ReferencesCard = ({ setNavTabSelected }) => {
  const {
    state: { referenceStatus, loading, referenceStatusInitFetchDone },
    fetchReferenceStatus,
    setReferenceStatusInitFetchDone,
  } = useContext(ReferenceContext);

  // Fetch reference status on component mount
  useEffect(() => {
    if (!referenceStatusInitFetchDone) {
      fetchReferenceStatus();
      setReferenceStatusInitFetchDone(true);
    }
  }, [
    referenceStatusInitFetchDone,
    fetchReferenceStatus,
    setReferenceStatusInitFetchDone,
  ]);

  const section = {
    id: 'references',
    title: 'References',
    description: 'Add professional references',
    icon: '📋',
    route: '/app/cv-builder',
  };

  console.log('referenceStatus', referenceStatus);

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
        {referenceStatus !== null && !loading && (
          <span className="status-indicator">
            {referenceStatus === 0 ? (
              <span style={{ color: '#e74c3c' }}>● 0</span>
            ) : referenceStatus === 1 ? (
              <span style={{ color: '#f39c12' }}>● 1</span>
            ) : referenceStatus === 2 ? (
              <span style={{ color: '#f1c40f' }}>● 2</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>● {referenceStatus}</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default ReferencesCard;
