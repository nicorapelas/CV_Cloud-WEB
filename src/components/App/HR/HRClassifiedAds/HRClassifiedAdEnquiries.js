import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as ClassifiedAdsContext } from '../../../../context/ClassifiedAdsContext';
import api from '../../../../api/api';
import hrLogo from '../../../../assets/images/logo-hr.png';
import TokenModal from '../HRDashboard/TokenModal';
import './HRClassifiedAds.css';

const HRClassifiedAdEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { state: { user }, signout } = useContext(AuthContext);
  const { state: { classifiedAdsActive } } = useContext(ClassifiedAdsContext);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/classified-ads/enquiries');
        if (!cancelled) setEnquiries(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Failed to load enquiries');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

  return (
    <div className="hr-classified-ads-page">
      {showTokenModal && <TokenModal onClose={() => setShowTokenModal(false)} />}
      <header className="hr-dashboard-header">
        <div className="hr-dashboard-header-content">
          <div className="hr-dashboard-logo">
            <img src={hrLogo} alt="CV Cloud HR" className="hr-dashboard-logo-image" />
          </div>
          <div className="hr-dashboard-user-info">
            <span>Welcome, {user?.fullName || 'HR Professional'}</span>
            <div className="hr-dashboard-header-actions">
              <button type="button" onClick={() => navigate('/app/hr-dashboard')} className="hr-dashboard-browse-button">HR Dashboard</button>
              {classifiedAdsActive && <Link to="/app/hr-classified-ads" className="hr-dashboard-browse-button">My Ads</Link>}
              <button type="button" onClick={() => navigate('/app/hr-browse-cvs')} className="hr-dashboard-browse-button">🔍 Browse CVs</button>
              {classifiedAdsActive && <button type="button" onClick={() => setShowTokenModal(true)} className="hr-dashboard-browse-button">🪙 Tokens</button>}
              {user?.isAdmin && <button type="button" onClick={() => navigate('/app/admin')} className="hr-dashboard-switch-button" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' }}>👑 Admin</button>}
              <button type="button" onClick={() => navigate('/app/dashboard')} className="hr-dashboard-switch-button">CV Dashboard</button>
              <button type="button" onClick={signout} className="hr-dashboard-signout">Sign Out</button>
            </div>
          </div>
          <button type="button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="hr-dashboard-mobile-menu-button" aria-label="Menu">
            <div className="hr-dashboard-hamburger"><span /><span /><span /></div>
          </button>
        </div>
        {isMobileMenuOpen && (
          <>
            <div className="hr-dashboard-mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="hr-dashboard-mobile-menu">
              <button type="button" onClick={() => { navigate('/app/hr-dashboard'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">HR Dashboard</button>
              {classifiedAdsActive && <button type="button" onClick={() => { navigate('/app/hr-classified-ads'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">My Ads</button>}
              <button type="button" onClick={() => { navigate('/app/hr-browse-cvs'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">🔍 Browse CVs</button>
              {classifiedAdsActive && <button type="button" onClick={() => { setShowTokenModal(true); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">🪙 Tokens</button>}
              {user?.isAdmin && <button type="button" onClick={() => { navigate('/app/admin'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button admin-button">👑 Admin</button>}
              <button type="button" onClick={() => { navigate('/app/dashboard'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">CV Dashboard</button>
              <button type="button" onClick={() => { signout(); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button signout-button">Sign Out</button>
            </div>
          </>
        )}
      </header>

      <main className="hr-classified-ads-main">
        <div className="hr-classified-ads-container">
          <div className="hr-classified-ads-title-row">
            <Link to="/app/hr-classified-ads" className="hr-classified-ads-new-btn" style={{ textDecoration: 'none' }}>← My Ads</Link>
            <h1 className="hr-classified-ads-title">Applications / Enquiries</h1>
          </div>

          {error && <div className="hr-classified-ads-error">{error}</div>}
          {loading ? (
            <div className="hr-classified-ads-loading">Loading…</div>
          ) : enquiries.length === 0 ? (
            <div className="hr-classified-ads-empty">No applications yet. They will appear here when candidates apply to your job listings.</div>
          ) : (
            <ul className="hr-classified-ads-list">
              {enquiries.map((eq) => (
                <li key={eq._id} className="hr-classified-ads-card">
                  <div className="hr-classified-ads-card-header">
                    <h2 className="hr-classified-ads-card-title">{eq._classifiedAd?.title || 'Ad'}</h2>
                    <span className="hr-classified-ads-card-date">{formatDate(eq.createdAt)}</span>
                  </div>
                  <p className="hr-classified-ads-card-meta">
                    From: {eq._user?.email || eq._user?.username || 'Unknown'}
                  </p>
                  <p className="hr-classified-ads-enquiry-cv-status">
                    {eq.includeCv !== false
                      ? (eq.applicantCvViewPin
                          ? <>✓ CV shared with application · <Link to={`/view-applicant-cv/${eq._id}?pin=${encodeURIComponent(eq.applicantCvViewPin)}&from=enquiries`} className="hr-classified-ads-view-cv-link">View CV</Link> · Pin: <strong className="hr-classified-ads-pin">{eq.applicantCvViewPin}</strong></>
                          : '✓ CV shared with application')
                      : 'Applicant chose not to share CV'}
                  </p>
                  <p className="hr-classified-ads-enquiry-message">{eq.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRClassifiedAdEnquiries;
