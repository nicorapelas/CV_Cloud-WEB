import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as NavContext } from '../../../context/NavContext';
import './Dashboard.css';

const Dashboard = () => {
  const {
    state: { user },
    signout,
  } = useContext(AuthContext);

  const {
    state: { navTabSelected },
    setNavTabSelected,
  } = useContext(NavContext);

  // Auto-scroll to top when component mounts
  useEffect(() => {
    // Cross-browser compatible scroll to top
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        // Modern browsers with smooth scrolling support
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback for older browsers or Firefox issues
        window.scrollTo(0, 0);
      }
    };

    // Small delay to ensure component is fully rendered
    setTimeout(scrollToTop, 100);
  }, []);

  const handleSignout = () => {
    signout();
  };

  const cvSections = [
    {
      id: 'personalInfo',
      title: 'Personal Information',
      description: 'Add your basic details and contact information',
      icon: '👤',
      route: '/app/cv-builder',
    },
    {
      id: 'contactInfo',
      title: 'Contact Information',
      description: 'Manage your contact details and social links',
      icon: '📞',
      route: '/app/cv-builder',
    },
    {
      id: 'personalSummary',
      title: 'Personal Summary',
      description: 'Write a compelling professional summary',
      icon: '📝',
      route: '/app/cv-builder',
    },
    {
      id: 'experience',
      title: 'Work Experience',
      description: 'Add your professional work history',
      icon: '💼',
      route: '/app/cv-builder',
    },
    {
      id: 'employmentHistory',
      title: 'Employment History',
      description: 'Track your complete employment timeline',
      icon: '📋',
      route: '/app/cv-builder',
    },
    {
      id: 'education',
      title: 'Secondary Education',
      description: 'Include your academic background',
      icon: '🎓',
      route: '/app/cv-builder',
    },
    {
      id: 'tertiaryEducation',
      title: 'Tertiary Education',
      description: 'Add your higher education qualifications',
      icon: '🎓',
      route: '/app/cv-builder',
    },
    {
      id: 'skills',
      title: 'Skills',
      description: 'Highlight your key skills and competencies',
      icon: '⚡',
      route: '/app/cv-builder',
    },
    {
      id: 'languages',
      title: 'Languages',
      description: 'List your language proficiencies',
      icon: '🌍',
      route: '/app/cv-builder',
    },
    {
      id: 'references',
      title: 'References',
      description: 'Add professional references',
      icon: '📋',
      route: '/app/cv-builder',
    },
    {
      id: 'interest',
      title: 'Interest',
      description: 'Add your personal interests and hobbies',
      icon: '🎯',
      route: '/app/cv-builder',
    },
    {
      id: 'firstImpression',
      title: 'First Impression',
      description: 'Create a video introduction',
      icon: '🎥',
      route: '/app/cv-builder',
    },
    {
      id: 'photo',
      title: 'Profile Photo',
      description: 'Add a professional photo',
      icon: '📸',
      route: '/app/cv-builder',
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <img
              src="/logo-h79.png"
              alt="CV Cloud Logo"
              className="dashboard-logo-image"
            />
          </div>
          <div className="dashboard-user-info">
            <span>Welcome, {user?.username || 'User'}</span>
            <button onClick={handleSignout} className="dashboard-signout">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-welcome">
            <h2>Build Your Professional CV</h2>
            <p>
              Complete each section to create a comprehensive and professional
              CV
            </p>
          </div>

          <div className="dashboard-sections">
            <div className="dashboard-sections-grid">
              {cvSections.map(section => (
                <Link
                  key={section.id}
                  to={section.route}
                  className="dashboard-section-card"
                  onClick={() => setNavTabSelected(section.id)}
                >
                  <div className="dashboard-section-icon">{section.icon}</div>
                  <div className="dashboard-section-content">
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                  <div className="dashboard-section-arrow">→</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="dashboard-actions">
            <Link to="/app/view-cv" className="dashboard-action-button">
              View CV
            </Link>
            <Link
              to="/app/share-cv"
              className="dashboard-action-button secondary"
            >
              Share CV
            </Link>
            <Link
              to="/app/cv-builder"
              className="dashboard-action-button secondary"
            >
              Edit CV
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
