import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as AttributeContext } from '../../../../context/AttributeContext';

const AttributesCard = ({ setNavTabSelected }) => {
  const {
    state: { attributeStatus, loading, attributeStatusInitFetchDone },
    fetchAttributeStatus,
    setAttributeStatusInitFetchDone,
  } = useContext(AttributeContext);

  // Fetch attribute status on component mount
  useEffect(() => {
    if (!attributeStatusInitFetchDone) {
      fetchAttributeStatus();
      setAttributeStatusInitFetchDone(true);
    }
  }, [
    attributeStatusInitFetchDone,
    fetchAttributeStatus,
    setAttributeStatusInitFetchDone,
  ]);

  const section = {
    id: 'attributes',
    title: 'Attributes',
    description: 'Add your personal attributes and qualities',
    icon: '✨',
    route: '/app/cv-builder',
  };

  console.log('attributeStatus', attributeStatus);

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
        {attributeStatus !== null && !loading && (
          <span className="status-indicator">
            {attributeStatus === 0 ? (
              <span style={{ color: '#e74c3c' }}>● 0</span>
            ) : attributeStatus === 1 ? (
              <span style={{ color: '#f39c12' }}>● 1</span>
            ) : attributeStatus === 2 ? (
              <span style={{ color: '#f1c40f' }}>● 2</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>● {attributeStatus}</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default AttributesCard;
