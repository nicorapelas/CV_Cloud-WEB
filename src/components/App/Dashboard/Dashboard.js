import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as NavContext } from '../../../context/NavContext';
import { Context as ClassifiedAdsContext } from '../../../context/ClassifiedAdsContext';
import { Context as PersonalInfoContext } from '../../../context/PersonalInfoContext';
import { Context as PhotoContext } from '../../../context/PhotoContext';
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
import EmploymentHistoryCard from './bitCards/EmploymentHistoryCard';
import CertificateCard from './bitCards/CertificateCard';
import CVVisibilityCard from './bitCards/CVVisibilityCard';
import ClassifiedAdsPreferencesCard from './bitCards/ClassifiedAdsPreferencesCard';
import NotificationCenter from '../../common/NotificationCenter/NotificationCenter';
import DashSwapLoader from '../../common/DashSwapLoader/DashSwapLoader';
import DashboardFooter from './DashboardFooter';
import ReferralsModal from './ReferralsModal';
import { getInitials, getAvatarStyle } from '../../../utils/avatarUtils';
import './Dashboard.css';

// Helper function to check if user data is fully loaded
const isUserDataComplete = userObj => {
  return (
    userObj &&
    userObj._id &&
    userObj.email !== undefined &&
    userObj.HR !== undefined // HR property must be explicitly set (true or false)
  );
};

const Dashboard = () => {
  const {
    state: { user, initLoginDone, loading },
    signout,
    setInitLoginDone,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  // Loader state
  const [showLoader, setShowLoader] = useState(false);
  const [switchingTo, setSwitchingTo] = useState('dashboard');

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showReferralsModal, setShowReferralsModal] = useState(false);

  const {
    state: { navTabSelected },
    setNavTabSelected,
  } = useContext(NavContext);

  const { state: { classifiedAdsActive } } = useContext(ClassifiedAdsContext);

  const {
    state: { personalInfo },
    fetchPersonalInfo,
  } = useContext(PersonalInfoContext);

  const {
    state: { assignedPhotoUrl },
    fetchAssignedPhoto,
  } = useContext(PhotoContext);

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

  useEffect(() => {
    // Only proceed if initLoginDone is explicitly false
    if (initLoginDone === false) {
      // Check if user data is completely loaded (including HR property)
      if (isUserDataComplete(user)) {
        const { HR } = user;

        if (HR === true) {
          navigate('/app/hr-dashboard');
          setInitLoginDone(true);
        } else if (HR === false) {
          navigate('/app/dashboard');
          setInitLoginDone(true);
        }
      }
    }
  }, [initLoginDone, user, loading, navigate]);

  useEffect(() => {
    fetchPersonalInfo();
    fetchAssignedPhoto();
  }, [fetchPersonalInfo, fetchAssignedPhoto]);

  const handleSignout = () => {
    signout();
  };

  const handleSwitchDashboard = () => {
    const { HR } = user;

    // Show loader first
    if (HR) {
      setSwitchingTo('hr-dashboard');
      setShowLoader(true);

      // Navigate after 3 seconds
      setTimeout(() => {
        navigate('/app/hr-dashboard');
        setShowLoader(false);
      }, 3000);
    } else {
      setSwitchingTo('dashboard');
      setShowLoader(true);

      // Navigate after 3 seconds
      setTimeout(() => {
        navigate('/hr-introduction');
        setShowLoader(false);
      }, 3000);
    }
  };

  return (
    <>
      <DashSwapLoader
        show={showLoader}
        switchingTo={switchingTo}
        delay={3000}
      />
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
              {personalInfo &&
                personalInfo.length > 0 &&
                personalInfo[0].fullName && (
                  <div className="dashboard-user-welcome">
                    <div
                      className="dashboard-user-avatar"
                      style={
                        assignedPhotoUrl &&
                        assignedPhotoUrl !== 'noneAssigned' &&
                        assignedPhotoUrl.trim() !== ''
                          ? {}
                          : getAvatarStyle(personalInfo[0].fullName, 36)
                      }
                    >
                      {assignedPhotoUrl &&
                      assignedPhotoUrl !== 'noneAssigned' &&
                      assignedPhotoUrl.trim() !== '' ? (
                        <>
                          <img
                            src={assignedPhotoUrl}
                            alt={personalInfo[0].fullName}
                            className="dashboard-user-avatar-image"
                            onError={e => {
                              // Fallback to initials if image fails to load
                              e.target.style.display = 'none';
                              const initialsSpan = e.target.nextSibling;
                              if (initialsSpan) {
                                initialsSpan.style.display = 'flex';
                              }
                            }}
                          />
                          <span
                            className="dashboard-user-avatar-initials"
                            style={{ display: 'none' }}
                          >
                            {getInitials(personalInfo[0].fullName)}
                          </span>
                        </>
                      ) : (
                        <span className="dashboard-user-avatar-initials">
                          {getInitials(personalInfo[0].fullName)}
                        </span>
                      )}
                    </div>
                    <span>Welcome, {personalInfo[0].fullName}</span>
                  </div>
                )}
              <div className="dashboard-header-actions">
                <NotificationCenter />
                {personalInfo &&
                personalInfo.length > 0 &&
                personalInfo[0].fullName ? (
                  <>
                    <Link to="/app/view-cv" className="dashboard-header-button">
                      View CV
                    </Link>
                    <Link
                      to="/app/share-cv"
                      className="dashboard-header-button"
                    >
                      Share CV
                    </Link>
                    {classifiedAdsActive && (
                      <Link
                        to="/app/classified-ads"
                        className="dashboard-header-button"
                      >
                        Job listings
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      className="dashboard-header-button disabled"
                      disabled
                      title="Please add your full name first"
                    >
                      View CV
                    </button>
                    <button
                      className="dashboard-header-button disabled"
                      disabled
                      title="Please add your full name first"
                    >
                      Share CV
                    </button>
                  </>
                )}
                {user && user.isAdmin && (
                  <Link
                    to="/app/admin"
                    className="dashboard-switch-button"
                    style={{
                      background:
                        'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                      textDecoration: 'none',
                    }}
                  >
                    👑 Admin Panel
                  </Link>
                )}
                {user && user.HR && (
                  <div
                    className="dashboard-switch-button"
                    onClick={handleSwitchDashboard}
                  >
                    HR Dashboard
                  </div>
                )}
                {classifiedAdsActive && (
                  <button
                    type="button"
                    className="dashboard-referrals-button"
                    onClick={() => setShowReferralsModal(true)}
                  >
                    Referrals
                  </button>
                )}
                <button onClick={handleSignout} className="dashboard-signout">
                  Sign Out
                </button>
              </div>
            </div>
            {/* Mobile Menu Button */}
            <button
              className="dashboard-mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <span
                className={`dashboard-hamburger ${isMobileMenuOpen ? 'active' : ''}`}
              >
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`dashboard-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
          >
            <NotificationCenter />
            {personalInfo &&
            personalInfo.length > 0 &&
            personalInfo[0].fullName ? (
              <>
                <Link
                  to="/app/view-cv"
                  className="dashboard-mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  View CV
                </Link>
                <Link
                  to="/app/share-cv"
                  className="dashboard-mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Share CV
                </Link>
                {classifiedAdsActive && (
                  <Link
                    to="/app/classified-ads"
                    className="dashboard-mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Job listings
                  </Link>
                )}
              </>
            ) : (
              <>
                <button
                  className="dashboard-mobile-nav-link disabled"
                  disabled
                  title="Please add your full name first"
                >
                  View CV
                </button>
                <button
                  className="dashboard-mobile-nav-link disabled"
                  disabled
                  title="Please add your full name first"
                >
                  Share CV
                </button>
              </>
            )}
            {user && user.isAdmin && (
              <Link
                to="/app/admin"
                className="dashboard-mobile-nav-link admin"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👑 Admin Panel
              </Link>
            )}
            {user && user.HR && (
              <button
                className="dashboard-mobile-nav-link hr"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSwitchDashboard();
                }}
              >
                HR Dashboard
              </button>
            )}
            {classifiedAdsActive && (
              <button
                type="button"
                className="dashboard-mobile-nav-link referrals"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowReferralsModal(true);
                }}
              >
                Referrals
              </button>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleSignout();
              }}
              className="dashboard-mobile-nav-link signout"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="dashboard-container">
            <h3 className="dashboard-sections-title">
              Create a professional CV that stands out from the crowd. Start
              with your First Impression video to make a lasting impact.
            </h3>
            {/* Hero First Impression Section */}
            <FirstImpressionCard setNavTabSelected={setNavTabSelected} />

            {/* CV Visibility Settings */}
            <CVVisibilityCard />

            {/* Job listings preferences (CV users only, when feature is on) */}
            {user && user.HR !== true && classifiedAdsActive && (
              <ClassifiedAdsPreferencesCard />
            )}

            {/* Regular CV Sections */}
            <div className="dashboard-sections">
              <div className="dashboard-sections-grid">
                <PhotoCard setNavTabSelected={setNavTabSelected} />
                <PersonalInfoCard setNavTabSelected={setNavTabSelected} />
                <ContactInfoCard setNavTabSelected={setNavTabSelected} />
                <PersonalSummaryCard setNavTabSelected={setNavTabSelected} />
                <EmploymentHistoryCard setNavTabSelected={setNavTabSelected} />
                <ExperienceCard setNavTabSelected={setNavTabSelected} />
                <EducationCard setNavTabSelected={setNavTabSelected} />
                <TertiaryEducationCard setNavTabSelected={setNavTabSelected} />
                <CertificateCard setNavTabSelected={setNavTabSelected} />
                <SkillsCard setNavTabSelected={setNavTabSelected} />
                <LanguagesCard setNavTabSelected={setNavTabSelected} />
                <AttributesCard setNavTabSelected={setNavTabSelected} />
                <InterestCard setNavTabSelected={setNavTabSelected} />
                <ReferencesCard setNavTabSelected={setNavTabSelected} />
              </div>
            </div>
            <div className="dashboard-actions"></div>
          </div>
        </main>

        {/* Footer */}
        <DashboardFooter />

        {classifiedAdsActive && showReferralsModal && (
          <ReferralsModal onClose={() => setShowReferralsModal(false)} />
        )}
      </div>
    </>
  );
};

export default Dashboard;
