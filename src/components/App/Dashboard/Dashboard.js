import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as NavContext } from '../../../context/NavContext';
import FirstImpressionCard from './bitCards/FirstImpressionCard';
import PersonalInfoCard from './bitCards/PersonalInfoCard';
import ContactInfoCard from './bitCards/ContactInfoCard';
import PersonalSummaryCard from './bitCards/PersonalSummaryCard';
import ExperienceCard from './bitCards/ExperienceCard';
import EducationCard from './bitCards/EducationCard';
import TertiaryEducationCard from './bitCards/TertiaryEducationCard';
import SkillsCard from './bitCards/SkillsCard';
import LanguagesCard from './bitCards/LanguagesCard';
import AttributesCard from './bitCards/AttributesCard';
import InterestCard from './bitCards/InterestCard';
import ReferencesCard from './bitCards/ReferencesCard';
import PhotoCard from './bitCards/PhotoCard';
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
          <h3 className="dashboard-sections-title">
            Create a professional CV that stands out from the crowd. Start with
            your First Impression video to make a lasting impact.
          </h3>
          {/* Hero First Impression Section */}
          <FirstImpressionCard setNavTabSelected={setNavTabSelected} />

          {/* Regular CV Sections */}
          <div className="dashboard-sections">
            <div className="dashboard-sections-grid">
              <PersonalInfoCard setNavTabSelected={setNavTabSelected} />
              <ContactInfoCard setNavTabSelected={setNavTabSelected} />
              <PersonalSummaryCard setNavTabSelected={setNavTabSelected} />
              <ExperienceCard setNavTabSelected={setNavTabSelected} />
              <EducationCard setNavTabSelected={setNavTabSelected} />
              <TertiaryEducationCard setNavTabSelected={setNavTabSelected} />
              <SkillsCard setNavTabSelected={setNavTabSelected} />
              <LanguagesCard setNavTabSelected={setNavTabSelected} />
              <AttributesCard setNavTabSelected={setNavTabSelected} />
              <InterestCard setNavTabSelected={setNavTabSelected} />
              <ReferencesCard setNavTabSelected={setNavTabSelected} />
              <PhotoCard setNavTabSelected={setNavTabSelected} />
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
