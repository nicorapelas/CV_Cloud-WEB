import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as SkillContext } from '../../../../context/SkillContext';

const SkillsCard = ({ setNavTabSelected }) => {
  const {
    state: { skillStatus, loading, skillStatusInitFetchDone },
    fetchSkillStatus,
    setSkillStatusInitFetchDone,
  } = useContext(SkillContext);

  // Fetch skill status on component mount
  useEffect(() => {
    if (!skillStatusInitFetchDone) {
      fetchSkillStatus();
      setSkillStatusInitFetchDone(true);
    }
  }, [skillStatusInitFetchDone, fetchSkillStatus, setSkillStatusInitFetchDone]);

  const section = {
    id: 'skills',
    title: 'Skills',
    description: 'Highlight your key skills and competencies',
    icon: '⚡',
    route: '/app/cv-builder',
  };

  console.log('skillStatus', skillStatus);

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
        {skillStatus !== null && !loading && (
          <span className="status-indicator">
            {skillStatus === 0 ? (
              <span style={{ color: '#e74c3c' }}>● 0</span>
            ) : skillStatus === 1 ? (
              <span style={{ color: '#f39c12' }}>● 1</span>
            ) : skillStatus === 2 ? (
              <span style={{ color: '#f1c40f' }}>● 2</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>● {skillStatus}</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default SkillsCard;
