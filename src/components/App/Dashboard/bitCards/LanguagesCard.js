import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as LanguageContext } from '../../../../context/LanguageContext';

const LanguagesCard = ({ setNavTabSelected }) => {
  const {
    state: { languageStatus, loading, languageStatusInitFetchDone },
    fetchLanguageStatus,
    setLanguageStatusInitFetchDone,
  } = useContext(LanguageContext);

  // Fetch language status on component mount
  useEffect(() => {
    if (!languageStatusInitFetchDone) {
      fetchLanguageStatus();
      setLanguageStatusInitFetchDone(true);
    }
  }, [
    languageStatusInitFetchDone,
    fetchLanguageStatus,
    setLanguageStatusInitFetchDone,
  ]);

  const section = {
    id: 'languages',
    title: 'Languages',
    description: 'List your language proficiencies',
    icon: '🌍',
    route: '/app/cv-builder',
  };

  console.log('languageStatus', languageStatus);

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
        {languageStatus !== null && !loading && (
          <span className="status-indicator">
            {languageStatus === 0 ? (
              <span style={{ color: '#e74c3c' }}>● 0</span>
            ) : languageStatus === 1 ? (
              <span style={{ color: '#f39c12' }}>● 1</span>
            ) : languageStatus === 2 ? (
              <span style={{ color: '#f1c40f' }}>● 2</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>● {languageStatus}</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default LanguagesCard;
