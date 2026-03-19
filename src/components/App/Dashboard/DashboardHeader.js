import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as ClassifiedAdsContext } from '../../../context/ClassifiedAdsContext';
import { Context as PersonalInfoContext } from '../../../context/PersonalInfoContext';
import { Context as PhotoContext } from '../../../context/PhotoContext';
import NotificationCenter from '../../common/NotificationCenter/NotificationCenter';
import DashSwapLoader from '../../common/DashSwapLoader/DashSwapLoader';
import ReferralsModal from './ReferralsModal';
import DashboardHeaderSecondaryRow from './DashboardHeaderSecondaryRow';
import { getInitials, getAvatarStyle } from '../../../utils/avatarUtils';
import './Dashboard.css';

/**
 * @param {Object} props
 * @param {boolean} [props.showSecondaryRow=false] - When true, shows the blue bar (typewriter + Job listings / Referrals). Use only on Dashboard.
 */
const DashboardHeader = ({ showSecondaryRow = false }) => {
  const {
    state: { user },
    signout,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    state: { classifiedAdsActive },
  } = useContext(ClassifiedAdsContext);

  const isViewCv =
    pathname === '/app/view-cv' || pathname.startsWith('/app/view-cv/');
  const isShareCv =
    pathname === '/app/share-cv' || pathname.startsWith('/app/share-cv/');
  const {
    state: { personalInfo },
    fetchPersonalInfo,
  } = useContext(PersonalInfoContext);
  const {
    state: { assignedPhotoUrl },
    fetchAssignedPhoto,
  } = useContext(PhotoContext);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showReferralsModal, setShowReferralsModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [switchingTo, setSwitchingTo] = useState('dashboard');

  useEffect(() => {
    fetchPersonalInfo();
    fetchAssignedPhoto();
  }, [fetchPersonalInfo, fetchAssignedPhoto]);

  const handleSwitchDashboard = () => {
    if (!user) return;
    const { HR } = user;
    if (HR) {
      setSwitchingTo('hr-dashboard');
      setShowLoader(true);
      setTimeout(() => {
        navigate('/app/hr-dashboard');
        setShowLoader(false);
      }, 3000);
    } else {
      setSwitchingTo('dashboard');
      setShowLoader(true);
      setTimeout(() => {
        navigate('/hr-introduction');
        setShowLoader(false);
      }, 3000);
    }
  };

  const hasAssignedPhoto =
    typeof assignedPhotoUrl === 'string' &&
    assignedPhotoUrl !== 'noneAssigned' &&
    assignedPhotoUrl.trim() !== '';

  return (
    <>
      <DashSwapLoader
        show={showLoader}
        switchingTo={switchingTo}
        delay={3000}
      />
      {showReferralsModal && (
        <ReferralsModal onClose={() => setShowReferralsModal(false)} />
      )}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <Link to="/app/dashboard">
              <img
                src="/logo-h79.png"
                alt="CV Cloud Logo"
                className="dashboard-logo-image"
              />
            </Link>
          </div>
          {personalInfo &&
            personalInfo.length > 0 &&
            personalInfo[0].fullName && (
              <div className="dashboard-user-welcome">
                <div
                  className="dashboard-user-avatar"
                  style={
                    hasAssignedPhoto
                      ? {}
                      : getAvatarStyle(personalInfo[0].fullName, 36)
                  }
                >
                  {hasAssignedPhoto ? (
                    <>
                      <img
                        src={assignedPhotoUrl}
                        alt={personalInfo[0].fullName}
                        className="dashboard-user-avatar-image"
                        onError={e => {
                          e.target.style.display = 'none';
                          const initialsSpan = e.target.nextSibling;
                          if (initialsSpan)
                            initialsSpan.style.display = 'flex';
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
                <span>Hi, {personalInfo[0].fullName.split(' ')[0]}</span>
              </div>
            )}
          <div className="dashboard-user-info">
            <div className="dashboard-header-actions">
              <NotificationCenter />
              {personalInfo &&
              personalInfo.length > 0 &&
              personalInfo[0].fullName ? (
                <>
                  <Link
                    to="/app/view-cv"
                    className={`dashboard-header-button${isViewCv ? ' active' : ''}`}
                  >
                    View CV
                  </Link>
                  <Link
                    to="/app/share-cv"
                    className={`dashboard-header-button${isShareCv ? ' active' : ''}`}
                  >
                    Share CV
                  </Link>
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
              {user && user.affiliate && (
                <button
                  type="button"
                  className="dashboard-referrals-button"
                  title="Referrals"
                  onClick={e => {
                    e.stopPropagation();
                    setShowReferralsModal(true);
                  }}
                >
                  <svg width="22" height="18" viewBox="0 0 24 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="4.5" r="3.5" />
                    <path d="M1 17c0-4 3.5-7 8-7s8 3 8 7" />
                    <circle cx="18.5" cy="6" r="2.5" />
                    <path d="M15 17c1.5-3 3.5-5 8-5" />
                    <path d="M14 2.5c1.2-1.5 3-2 4.5-1.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M17.5 0l1.2 1.2-1.6.6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <button onClick={signout} className="dashboard-signout">
                Sign Out
              </button>
            </div>
          </div>
          <button
            type="button"
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

        {showSecondaryRow && (
          <DashboardHeaderSecondaryRow
            onOpenReferrals={() => setShowReferralsModal(true)}
          />
        )}

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
                className={`dashboard-mobile-nav-link${isViewCv ? ' active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                View CV
              </Link>
              <Link
                to="/app/share-cv"
                className={`dashboard-mobile-nav-link${isShareCv ? ' active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Share CV
              </Link>
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
              type="button"
              className="dashboard-mobile-nav-link hr"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleSwitchDashboard();
              }}
            >
              HR Dashboard
            </button>
          )}
          {user && user.affiliate && (
            <button
              type="button"
              className="dashboard-mobile-nav-link referrals"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowReferralsModal(true);
              }}
            >
              <svg width="18" height="15" viewBox="0 0 24 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}>
                <circle cx="9" cy="4.5" r="3.5" />
                <path d="M1 17c0-4 3.5-7 8-7s8 3 8 7" />
                <circle cx="18.5" cy="6" r="2.5" />
                <path d="M15 17c1.5-3 3.5-5 8-5" />
                <path d="M14 2.5c1.2-1.5 3-2 4.5-1.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M17.5 0l1.2 1.2-1.6.6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Referrals
            </button>
          )}
          <button
            type="button"
            className="dashboard-mobile-nav-link signout"
            onClick={() => {
              setIsMobileMenuOpen(false);
              signout();
            }}
          >
            Sign Out
          </button>
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
