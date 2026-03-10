import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../../context/AuthContext';
import api from '../../../../api/api';
import hrLogo from '../../../../assets/images/logo-hr.png';
import TokenModal from '../HRDashboard/TokenModal';
import './HRClassifiedAds.css';

const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  expired: 'Expired',
  closed: 'Closed',
};
const STATUS_CLASS = {
  draft: 'status-draft',
  published: 'status-published',
  expired: 'status-expired',
  closed: 'status-closed',
};

const HRClassifiedAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of ad being published/closed/deleted
  const [detailModalAd, setDetailModalAd] = useState(null); // ad shown in details modal
  const [showExpiredAds, setShowExpiredAds] = useState(false);

  const {
    state: { user },
    signout,
  } = useContext(AuthContext);

  const currentAds = ads.filter(a => a.status === 'published');
  const upcomingAds = ads.filter(a => a.status === 'draft');
  const expiredAds = ads.filter(
    a => a.status === 'expired' || a.status === 'closed'
  );
  const navigate = useNavigate();

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/classified-ads');
      setAds(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handlePublish = async ad => {
    if (!ad.publishDays || ad.publishDays.length === 0) {
      alert('Add at least one publish day in Edit, then Publish.');
      return;
    }
    setActionLoading(ad._id);
    try {
      await api.post(`/api/classified-ads/${ad._id}/publish`, {
        publishDays: ad.publishDays,
      });
      await fetchAds();
      setDetailModalAd(null);
    } catch (err) {
      const d = err.response?.data;
      if (d?.error === 'Insufficient token balance') {
        alert(
          `Insufficient tokens. Need ${d.required}, you have ${d.current}. Get more tokens and try again.`
        );
      } else {
        alert(d?.error || 'Failed to publish');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async ad => {
    if (
      !window.confirm(
        'Are you sure you want to close this ad? It will no longer be visible to applicants.'
      )
    )
      return;
    setActionLoading(ad._id);
    try {
      await api.post(`/api/classified-ads/${ad._id}/close`);
      await fetchAds();
      setDetailModalAd(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async ad => {
    if (!window.confirm('Delete this draft?')) return;
    setActionLoading(ad._id);
    try {
      await api.delete(`/api/classified-ads/${ad._id}`);
      await fetchAds();
      setDetailModalAd(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSwitchToDashboard = () => {
    navigate('/app/dashboard');
  };

  const formatDate = d =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';
  const formatPublishDay = d =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

  const renderAdCard = ad => (
    <li key={ad._id} className="hr-classified-ads-card">
      <div className="hr-classified-ads-card-summary">
        <div className="hr-classified-ads-card-status-row">
          <span
            className={`hr-classified-ads-status ${STATUS_CLASS[ad.status] || ''}`}
          >
            {STATUS_LABELS[ad.status] || ad.status}
          </span>
        </div>
        <h2 className="hr-classified-ads-card-title">{ad.title}</h2>
        <p className="hr-classified-ads-card-meta">
          {ad.companyName}
          {ad.location ? ` · ${ad.location}` : ''}
        </p>
        {(ad.jobType || ad.category) && (
          <p className="hr-classified-ads-card-tags">
            {[ad.jobType, ad.category].filter(Boolean).join(' · ')}
          </p>
        )}
        {ad.publishedAt && (
          <p className="hr-classified-ads-card-date">
            Published {formatDate(ad.publishedAt)} · {ad.tokenCost} token
            {ad.tokenCost !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      {ad.enquiryCount > 0 && (
        <div className="hr-classified-ads-card-applicants-row">
          <Link
            to={`/app/hr-classified-ads/enquiries?adId=${ad._id}`}
            className="hr-classified-ads-btn applicants applicants-pulse"
          >
            View Applicants ({ad.enquiryCount})
          </Link>
        </div>
      )}
      <div className="hr-classified-ads-card-actions">
        <button
          type="button"
          onClick={() => setDetailModalAd(ad)}
          className="hr-classified-ads-btn secondary"
        >
          Details
        </button>
        {ad.status === 'draft' && (
          <>
            <Link
              to={`/app/hr-classified-ads/${ad._id}/edit`}
              className="hr-classified-ads-btn secondary"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handlePublish(ad)}
              className="hr-classified-ads-btn primary"
              disabled={actionLoading === ad._id}
            >
              {actionLoading === ad._id ? 'Publishing…' : 'Publish'}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(ad)}
              className="hr-classified-ads-btn delete"
              disabled={actionLoading === ad._id}
            >
              Delete
            </button>
          </>
        )}
        {(ad.status === 'published' || ad.status === 'expired') && (
          <button
            type="button"
            onClick={() => handleClose(ad)}
            className="hr-classified-ads-btn secondary"
            disabled={actionLoading === ad._id}
          >
            {actionLoading === ad._id ? 'Closing…' : 'Close ad'}
          </button>
        )}
      </div>
    </li>
  );

  return (
    <div className="hr-classified-ads-page">
      {showTokenModal && (
        <TokenModal onClose={() => setShowTokenModal(false)} />
      )}
      {detailModalAd && (
        <div
          className="hr-ad-detail-modal-overlay"
          onClick={() => setDetailModalAd(null)}
        >
          <div
            className="hr-ad-detail-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="hr-ad-detail-modal-header">
              <h2 className="hr-ad-detail-modal-title">
                {detailModalAd.title}
              </h2>
              <button
                type="button"
                className="hr-ad-detail-modal-close"
                onClick={() => setDetailModalAd(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="hr-ad-detail-modal-body">
              <p className="hr-ad-detail-modal-meta">
                <span
                  className={`hr-classified-ads-status ${STATUS_CLASS[detailModalAd.status] || ''}`}
                >
                  {STATUS_LABELS[detailModalAd.status] || detailModalAd.status}
                </span>
                {' · '}
                {detailModalAd.companyName}
                {detailModalAd.location ? ` · ${detailModalAd.location}` : ''}
              </p>
              {(detailModalAd.jobType || detailModalAd.category) && (
                <p className="hr-ad-detail-modal-tags">
                  {[detailModalAd.jobType, detailModalAd.category]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {detailModalAd.publishedAt && (
                <p className="hr-ad-detail-modal-date">
                  Published {formatDate(detailModalAd.publishedAt)} ·{' '}
                  {detailModalAd.tokenCost} token
                  {detailModalAd.tokenCost !== 1 ? 's' : ''}
                </p>
              )}
              {detailModalAd.description && (
                <div className="hr-ad-detail-modal-section">
                  <h4 className="hr-ad-detail-modal-label">Description</h4>
                  <div className="hr-ad-detail-modal-content">
                    {detailModalAd.description}
                  </div>
                </div>
              )}
              {detailModalAd.contactInstructions && (
                <div className="hr-ad-detail-modal-section">
                  <h4 className="hr-ad-detail-modal-label">How to apply</h4>
                  <div className="hr-ad-detail-modal-content">
                    {detailModalAd.contactInstructions}
                  </div>
                </div>
              )}
              {detailModalAd.publishDays &&
                detailModalAd.publishDays.length > 0 && (
                  <div className="hr-ad-detail-modal-section">
                    <h4 className="hr-ad-detail-modal-label">Scheduled days</h4>
                    <ul className="hr-ad-detail-modal-publish-days">
                      {detailModalAd.publishDays.map((day, i) => (
                        <li key={i}>{formatPublishDay(day)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              <div className="hr-ad-detail-modal-actions">
                {detailModalAd.status === 'draft' && (
                  <>
                    <Link
                      to={`/app/hr-classified-ads/${detailModalAd._id}/edit`}
                      className="hr-classified-ads-btn secondary"
                      onClick={() => setDetailModalAd(null)}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handlePublish(detailModalAd)}
                      className="hr-classified-ads-btn primary"
                      disabled={actionLoading === detailModalAd._id}
                    >
                      {actionLoading === detailModalAd._id
                        ? 'Publishing…'
                        : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(detailModalAd)}
                      className="hr-classified-ads-btn delete"
                      disabled={actionLoading === detailModalAd._id}
                    >
                      Delete
                    </button>
                  </>
                )}
                {(detailModalAd.status === 'published' ||
                  detailModalAd.status === 'expired') && (
                  <button
                    type="button"
                    onClick={() => handleClose(detailModalAd)}
                    className="hr-classified-ads-btn secondary"
                    disabled={actionLoading === detailModalAd._id}
                  >
                    {actionLoading === detailModalAd._id
                      ? 'Closing…'
                      : 'Close ad'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailModalAd(null)}
                  className="hr-classified-ads-btn secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <header className="hr-dashboard-header">
        <div className="hr-dashboard-header-content">
          <div className="hr-dashboard-logo">
            <img
              src={hrLogo}
              alt="CV Cloud HR"
              className="hr-dashboard-logo-image"
            />
          </div>
          <div className="hr-dashboard-user-info">
            <span>Hi, {user?.fullName || 'HR Professional'}</span>
            <div className="hr-dashboard-header-actions">
              <button
                type="button"
                onClick={() => navigate('/app/hr-dashboard')}
                className="hr-dashboard-browse-button"
              >
                HR Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/hr-browse-cvs')}
                className="hr-dashboard-browse-button"
              >
                🔍 Browse CVs
              </button>
              <button
                type="button"
                onClick={() => setShowTokenModal(true)}
                className="hr-dashboard-browse-button"
              >
                🪙 Tokens
              </button>
              {user?.isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/app/admin')}
                  className="hr-dashboard-switch-button"
                  style={{
                    background:
                      'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                  }}
                >
                  👑 Admin
                </button>
              )}
              <button
                type="button"
                onClick={handleSwitchToDashboard}
                className="hr-dashboard-switch-button"
              >
                CV Dashboard
              </button>
              <button
                type="button"
                onClick={signout}
                className="hr-dashboard-signout"
              >
                Sign Out
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hr-dashboard-mobile-menu-button"
            aria-label="Menu"
          >
            <div className="hr-dashboard-hamburger">
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>
        {isMobileMenuOpen && (
          <>
            <div
              className="hr-dashboard-mobile-menu-backdrop"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="hr-dashboard-mobile-menu">
              <button
                type="button"
                onClick={() => {
                  navigate('/app/hr-dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="hr-dashboard-mobile-nav-button"
              >
                HR Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/app/hr-browse-cvs');
                  setIsMobileMenuOpen(false);
                }}
                className="hr-dashboard-mobile-nav-button"
              >
                🔍 Browse CVs
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTokenModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="hr-dashboard-mobile-nav-button"
              >
                🪙 Tokens
              </button>
              {user?.isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/app/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="hr-dashboard-mobile-nav-button admin-button"
                >
                  👑 Admin
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  handleSwitchToDashboard();
                  setIsMobileMenuOpen(false);
                }}
                className="hr-dashboard-mobile-nav-button"
              >
                CV Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  signout();
                  setIsMobileMenuOpen(false);
                }}
                className="hr-dashboard-mobile-nav-button signout-button"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </header>

      <main className="hr-classified-ads-main">
        <div className="hr-classified-ads-container">
          <div className="hr-classified-ads-title-row">
            <div className="hr-classified-ads-title-left">
              <button
                type="button"
                className="hr-classified-ads-back-btn"
                onClick={() => navigate('/app/hr-dashboard')}
              >
                ← Back
              </button>
            </div>
            <h1 className="hr-classified-ads-title">My Classified Ads</h1>
            <div className="hr-classified-ads-title-actions">
              <Link
                to="/app/hr-classified-ads/enquiries"
                className="hr-classified-ads-back-btn"
              >
                View applications
              </Link>
              <Link
                to="/app/hr-classified-ads/new"
                className="hr-classified-ads-new-btn"
              >
                + New Ad
              </Link>
            </div>
          </div>

          {error && <div className="hr-classified-ads-error">{error}</div>}
          {loading ? (
            <div className="hr-classified-ads-loading">Loading ads…</div>
          ) : ads.length === 0 ? (
            <div className="hr-classified-ads-empty">
              <p>You have no classified ads yet.</p>
              <Link
                to="/app/hr-classified-ads/new"
                className="hr-classified-ads-new-btn"
              >
                Create your first ad
              </Link>
            </div>
          ) : (
            <div className="hr-classified-ads-sections">
              {currentAds.length > 0 && (
                <section
                  className="hr-classified-ads-section"
                  aria-label="Current ads"
                >
                  <h2 className="hr-classified-ads-section-title">Current</h2>
                  <ul className="hr-classified-ads-list">
                    {currentAds.map(renderAdCard)}
                  </ul>
                </section>
              )}
              {upcomingAds.length > 0 && (
                <section
                  className="hr-classified-ads-section"
                  aria-label="Upcoming ads"
                >
                  <h2 className="hr-classified-ads-section-title">Upcoming</h2>
                  <ul className="hr-classified-ads-list">
                    {upcomingAds.map(renderAdCard)}
                  </ul>
                </section>
              )}
              {expiredAds.length > 0 && (
                <section
                  className="hr-classified-ads-section hr-classified-ads-expired-section"
                  aria-label="Expired ads"
                >
                  <button
                    type="button"
                    onClick={() => setShowExpiredAds(prev => !prev)}
                    className="hr-classified-ads-view-expired-btn"
                    aria-expanded={showExpiredAds}
                  >
                    {showExpiredAds ? 'Hide expired ads' : 'View expired ads'}
                  </button>
                  {showExpiredAds && (
                    <ul className="hr-classified-ads-list">
                      {expiredAds.map(renderAdCard)}
                    </ul>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRClassifiedAds;
