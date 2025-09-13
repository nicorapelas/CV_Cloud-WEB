import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as ContactInfoContext } from '../../../../context/ContactInfoContext';

const ContactInfoCard = ({ setNavTabSelected }) => {
  const {
    state: { contactInfoStatus, loading, contactInfoInitFetchDone },
    fetchContactInfoStatus,
    setContactInfoInitStatusFetchDone,
  } = useContext(ContactInfoContext);

  // Fetch contact info status on component mount
  useEffect(() => {
    if (!contactInfoInitFetchDone) {
      fetchContactInfoStatus();
      setContactInfoInitStatusFetchDone(true);
    }
  }, [
    contactInfoInitFetchDone,
    fetchContactInfoStatus,
    setContactInfoInitStatusFetchDone,
  ]);

  const section = {
    id: 'contactInfo',
    title: 'Contact Information',
    description: 'Manage your contact details and social links',
    icon: '📞',
    route: '/app/cv-builder',
  };

  console.log('contactInfoStatus', contactInfoStatus);

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
        {contactInfoStatus !== null && !loading && (
          <span className="status-indicator">
            {contactInfoStatus === null || contactInfoStatus === 0 ? (
              <span style={{ color: '#e74c3c' }}>● {contactInfoStatus}%</span>
            ) : contactInfoStatus > 0 && contactInfoStatus < 35 ? (
              <span style={{ color: '#f39c12' }}>● {contactInfoStatus}%</span>
            ) : contactInfoStatus > 36 && contactInfoStatus < 68 ? (
              <span style={{ color: '#f1c40f' }}>● {contactInfoStatus}%</span>
            ) : (
              <span style={{ color: '#2ecc71' }}>● {contactInfoStatus}%</span>
            )}
          </span>
        )}
      </div>
      <div className="dashboard-section-arrow">→</div>
    </Link>
  );
};

export default ContactInfoCard;
