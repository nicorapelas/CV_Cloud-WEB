import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../../context/AuthContext';
import api from '../../../../api/api';
import hrLogo from '../../../../assets/images/logo-hr.png';
import TokenModal from '../HRDashboard/TokenModal';
import './HRClassifiedAds.css';

const STATUS_LABELS = { draft: 'Draft', published: 'Published', expired: 'Expired', closed: 'Closed' };
const STATUS_CLASS = { draft: 'status-draft', published: 'status-published', expired: 'status-expired', closed: 'status-closed' };

const HRClassifiedAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of ad being published/closed/deleted

  const { state: { user }, signout } = useContext(AuthContext);
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

  const handlePublish = async (ad) => {
    if (!ad.publishDays || ad.publishDays.length === 0) {
      alert('Add at least one publish day in Edit, then Publish.');
      return;
    }
    setActionLoading(ad._id);
    try {
      await api.post(`/api/classified-ads/${ad._id}/publish`, { publishDays: ad.publishDays });
      await fetchAds();
    } catch (err) {
      const d = err.response?.data;
      if (d?.error === 'Insufficient token balance') {
        alert(`Insufficient tokens. Need ${d.required}, you have ${d.current}. Get more tokens and try again.`);
      } else {
        alert(d?.error || 'Failed to publish');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (ad) => {
    setActionLoading(ad._id);
    try {
      await api.post(`/api/classified-ads/${ad._id}/close`);
      await fetchAds();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (ad) => {
    if (!window.confirm('Delete this draft?')) return;
    setActionLoading(ad._id);
    try {
      await api.delete(`/api/classified-ads/${ad._id}`);
      await fetchAds();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSwitchToDashboard = () => {
    navigate('/app/dashboard');
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

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
              <button type="button" onClick={() => navigate('/app/hr-browse-cvs')} className="hr-dashboard-browse-button">🔍 Browse CVs</button>
              <button type="button" onClick={() => setShowTokenModal(true)} className="hr-dashboard-browse-button">🪙 Tokens</button>
              {user?.isAdmin && (
                <button type="button" onClick={() => navigate('/app/admin')} className="hr-dashboard-switch-button" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' }}>👑 Admin</button>
              )}
              <button type="button" onClick={handleSwitchToDashboard} className="hr-dashboard-switch-button">CV Dashboard</button>
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
              <button type="button" onClick={() => { navigate('/app/hr-browse-cvs'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">🔍 Browse CVs</button>
              <button type="button" onClick={() => { setShowTokenModal(true); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">🪙 Tokens</button>
              {user?.isAdmin && <button type="button" onClick={() => { navigate('/app/admin'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button admin-button">👑 Admin</button>}
              <button type="button" onClick={() => { handleSwitchToDashboard(); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">CV Dashboard</button>
              <button type="button" onClick={() => { signout(); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button signout-button">Sign Out</button>
            </div>
          </>
        )}
      </header>

      <main className="hr-classified-ads-main">
        <div className="hr-classified-ads-container">
          <div className="hr-classified-ads-title-row">
            <h1 className="hr-classified-ads-title">My Classified Ads</h1>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/app/hr-classified-ads/enquiries" className="hr-classified-ads-btn secondary">View applications</Link>
              <Link to="/app/hr-classified-ads/new" className="hr-classified-ads-new-btn">+ New Ad</Link>
            </div>
          </div>

          {error && <div className="hr-classified-ads-error">{error}</div>}
          {loading ? (
            <div className="hr-classified-ads-loading">Loading ads…</div>
          ) : ads.length === 0 ? (
            <div className="hr-classified-ads-empty">
              <p>You have no classified ads yet.</p>
              <Link to="/app/hr-classified-ads/new" className="hr-classified-ads-new-btn">Create your first ad</Link>
            </div>
          ) : (
            <ul className="hr-classified-ads-list">
              {ads.map((ad) => (
                <li key={ad._id} className="hr-classified-ads-card">
                  <div className="hr-classified-ads-card-header">
                    <h2 className="hr-classified-ads-card-title">{ad.title}</h2>
                    <span className={`hr-classified-ads-status ${STATUS_CLASS[ad.status] || ''}`}>{STATUS_LABELS[ad.status] || ad.status}</span>
                  </div>
                  <p className="hr-classified-ads-card-meta">{ad.companyName}{ad.location ? ` · ${ad.location}` : ''}</p>
                  {ad.publishedAt && <p className="hr-classified-ads-card-date">Published {formatDate(ad.publishedAt)} · {ad.tokenCost} token{ad.tokenCost !== 1 ? 's' : ''}</p>}
                  <div className="hr-classified-ads-card-actions">
                    {ad.status === 'draft' && (
                      <>
                        <Link to={`/app/hr-classified-ads/${ad._id}/edit`} className="hr-classified-ads-btn secondary">Edit</Link>
                        <button type="button" onClick={() => handlePublish(ad)} className="hr-classified-ads-btn primary" disabled={actionLoading === ad._id}>
                          {actionLoading === ad._id ? 'Publishing…' : 'Publish'}
                        </button>
                        <button type="button" onClick={() => handleDelete(ad)} className="hr-classified-ads-btn delete" disabled={actionLoading === ad._id}>Delete</button>
                      </>
                    )}
                    {(ad.status === 'published' || ad.status === 'expired') && (
                      <button type="button" onClick={() => handleClose(ad)} className="hr-classified-ads-btn secondary" disabled={actionLoading === ad._id}>
                        {actionLoading === ad._id ? 'Closing…' : 'Close ad'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRClassifiedAds;
