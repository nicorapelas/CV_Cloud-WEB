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
  const { state: { user }, signout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state: { classifiedAdsActive } } = useContext(ClassifiedAdsContext);

  const isViewCv = pathname === '/app/view-cv' || pathname.startsWith('/app/view-cv/');
  const isShareCv = pathname === '/app/share-cv' || pathname.startsWith('/app/share-cv/');
  const { state: { personalInfo }, fetchPersonalInfo } = useContext(PersonalInfoContext);
  const { state: { assignedPhotoUrl }, fetchAssignedPhoto } = useContext(PhotoContext);

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

  return (
    <>
      <DashSwapLoader show={showLoader} switchingTo={switchingTo} delay={3000} />
      {showReferralsModal && (
        <ReferralsModal onClose={() => setShowReferralsModal(false)} />
      )}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <Link to="/app/dashboard">
              <img src="/logo-h79.png" alt="CV Cloud Logo" className="dashboard-logo-image" />
            </Link>
          </div>
          <div className="dashboard-user-info">
            {personalInfo && personalInfo.length > 0 && personalInfo[0].fullName && (
              <div className="dashboard-user-welcome">
                <div
                  className="dashboard-user-avatar"
                  style={
                    assignedPhotoUrl && assignedPhotoUrl !== 'noneAssigned' && assignedPhotoUrl.trim() !== ''
                      ? {}
                      : getAvatarStyle(personalInfo[0].fullName, 36)
                  }
                >
                  {assignedPhotoUrl && assignedPhotoUrl !== 'noneAssigned' && assignedPhotoUrl.trim() !== '' ? (
                    <>
                      <img
                        src={assignedPhotoUrl}
                        alt={personalInfo[0].fullName}
                        className="dashboard-user-avatar-image"
                        onError={e => {
                          e.target.style.display = 'none';
                          const initialsSpan = e.target.nextSibling;
                          if (initialsSpan) initialsSpan.style.display = 'flex';
                        }}
                      />
                      <span className="dashboard-user-avatar-initials" style={{ display: 'none' }}>
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
              {personalInfo && personalInfo.length > 0 && personalInfo[0].fullName ? (
                <>
                  <Link to="/app/view-cv" className={`dashboard-header-button${isViewCv ? ' active' : ''}`}>View CV</Link>
                  <Link to="/app/share-cv" className={`dashboard-header-button${isShareCv ? ' active' : ''}`}>Share CV</Link>
                </>
              ) : (
                <>
                  <button className="dashboard-header-button disabled" disabled title="Please add your full name first">View CV</button>
                  <button className="dashboard-header-button disabled" disabled title="Please add your full name first">Share CV</button>
                </>
              )}
              {user && user.isAdmin && (
                <Link to="/app/admin" className="dashboard-switch-button" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)', textDecoration: 'none' }}>
                  👑 Admin Panel
                </Link>
              )}
              {user && user.HR && (
                <div className="dashboard-switch-button" onClick={handleSwitchDashboard}>HR Dashboard</div>
              )}
              {user && user.affiliate && (
                <button type="button" className="dashboard-referrals-button" onClick={(e) => { e.stopPropagation(); setShowReferralsModal(true); }}>Referrals</button>
              )}
              <button onClick={signout} className="dashboard-signout">Sign Out</button>
            </div>
          </div>
          <button type="button" className="dashboard-mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu">
            <span className={`dashboard-hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span><span></span><span></span>
            </span>
          </button>
        </div>

        {showSecondaryRow && (
          <DashboardHeaderSecondaryRow onOpenReferrals={() => setShowReferralsModal(true)} />
        )}

        <div className={`dashboard-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <NotificationCenter />
          {personalInfo && personalInfo.length > 0 && personalInfo[0].fullName ? (
            <>
              <Link to="/app/view-cv" className={`dashboard-mobile-nav-link${isViewCv ? ' active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>View CV</Link>
              <Link to="/app/share-cv" className={`dashboard-mobile-nav-link${isShareCv ? ' active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Share CV</Link>
            </>
          ) : (
            <>
              <button className="dashboard-mobile-nav-link disabled" disabled title="Please add your full name first">View CV</button>
              <button className="dashboard-mobile-nav-link disabled" disabled title="Please add your full name first">Share CV</button>
            </>
          )}
          {user && user.isAdmin && (
            <Link to="/app/admin" className="dashboard-mobile-nav-link admin" onClick={() => setIsMobileMenuOpen(false)}>👑 Admin Panel</Link>
          )}
          {user && user.HR && (
            <button type="button" className="dashboard-mobile-nav-link hr" onClick={() => { setIsMobileMenuOpen(false); handleSwitchDashboard(); }}>HR Dashboard</button>
          )}
          {user && user.affiliate && (
            <button type="button" className="dashboard-mobile-nav-link referrals" onClick={() => { setIsMobileMenuOpen(false); setShowReferralsModal(true); }}>Referrals</button>
          )}
          <button type="button" className="dashboard-mobile-nav-link signout" onClick={() => { setIsMobileMenuOpen(false); signout(); }}>Sign Out</button>
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
