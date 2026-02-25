import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Context as AuthContext } from '../../../../context/AuthContext';
import api from '../../../../api/api';
import hrLogo from '../../../../assets/images/logo-hr.png';
import TokenModal from '../HRDashboard/TokenModal';
import './HRClassifiedAdForm.css';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship', 'freelance'];
const ENQUIRY_PREFERENCES = [
  { value: 'app', label: 'In-app only' },
  { value: 'email', label: 'Email only' },
  { value: 'both', label: 'Both' },
];

const toDateOnly = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const HRClassifiedAdForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { state: { user }, signout } = useContext(AuthContext);

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [category, setCategory] = useState('');
  const [contactInstructions, setContactInstructions] = useState('');
  const [enquiryPreference, setEnquiryPreference] = useState('both');
  const [publishDays, setPublishDays] = useState([]); // array of YYYY-MM-DD strings

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/classified-ads/${id}`);
        if (cancelled) return;
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCompanyName(data.companyName || '');
        setLocation(data.location || '');
        setJobType(data.jobType || '');
        setCategory(data.category || '');
        setContactInstructions(data.contactInstructions || '');
        setEnquiryPreference(data.enquiryPreference || 'both');
        setPublishDays((data.publishDays || []).map(toDateOnly).filter(Boolean));
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Failed to load ad');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const addPublishDay = () => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    setPublishDays((prev) => [...prev, toDateOnly(next)].sort());
  };

  const removePublishDay = (index) => {
    setPublishDays((prev) => prev.filter((_, i) => i !== index));
  };

  const changePublishDay = (index, value) => {
    setPublishDays((prev) => {
      const next = [...prev];
      next[index] = value;
      return next.sort();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      companyName: companyName.trim(),
      location: location.trim(),
      jobType: jobType || '',
      category: category.trim(),
      contactInstructions: contactInstructions.trim(),
      enquiryPreference,
      publishDays: publishDays.filter(Boolean).map((d) => new Date(d).toISOString()),
    };
    try {
      if (isEdit) {
        await api.put(`/api/classified-ads/${id}`, payload);
        navigate('/app/hr-classified-ads');
      } else {
        await api.post('/api/classified-ads', payload);
        navigate('/app/hr-classified-ads');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!isEdit) return;
    const days = publishDays.filter(Boolean);
    if (days.length === 0) {
      setError('Add at least one publish day to publish.');
      return;
    }
    setError(null);
    setPublishing(true);
    try {
      await api.post(`/api/classified-ads/${id}/publish`, {
        publishDays: days.map((d) => new Date(d).toISOString()),
      });
      navigate('/app/hr-classified-ads');
    } catch (err) {
      const d = err.response?.data;
      if (d?.error === 'Insufficient token balance') {
        setError(`Insufficient tokens. Need ${d.required}, you have ${d.current}.`);
      } else {
        setError(d?.error || 'Failed to publish');
      }
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="hr-ad-form-page">
        <div className="hr-ad-form-container"><p>Loading…</p></div>
      </div>
    );
  }

  return (
    <div className="hr-ad-form-page">
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
              <Link to="/app/hr-classified-ads" className="hr-dashboard-browse-button">My Ads</Link>
              <button type="button" onClick={() => navigate('/app/hr-browse-cvs')} className="hr-dashboard-browse-button">🔍 Browse CVs</button>
              <button type="button" onClick={() => setShowTokenModal(true)} className="hr-dashboard-browse-button">🪙 Tokens</button>
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
              <button type="button" onClick={() => { navigate('/app/hr-classified-ads'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">My Ads</button>
              <button type="button" onClick={() => { navigate('/app/hr-browse-cvs'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">🔍 Browse CVs</button>
              <button type="button" onClick={() => { setShowTokenModal(true); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">🪙 Tokens</button>
              {user?.isAdmin && <button type="button" onClick={() => { navigate('/app/admin'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button admin-button">👑 Admin</button>}
              <button type="button" onClick={() => { navigate('/app/dashboard'); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button">CV Dashboard</button>
              <button type="button" onClick={() => { signout(); setIsMobileMenuOpen(false); }} className="hr-dashboard-mobile-nav-button signout-button">Sign Out</button>
            </div>
          </>
        )}
      </header>

      <main className="hr-ad-form-main">
        <div className="hr-ad-form-container">
          <div className="hr-ad-form-title-row">
            <Link to="/app/hr-classified-ads" className="hr-ad-form-back">← My Ads</Link>
            <h1 className="hr-ad-form-title">{isEdit ? 'Edit ad' : 'New classified ad'}</h1>
          </div>

          {error && <div className="hr-ad-form-error">{error}</div>}

          <form onSubmit={handleSubmit} className="hr-ad-form">
            <label className="hr-ad-form-label">Title *</label>
            <input type="text" className="hr-ad-form-input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} placeholder="Job title" />

            <label className="hr-ad-form-label">Description *</label>
            <textarea className="hr-ad-form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={5000} placeholder="Full description" rows={5} />

            <label className="hr-ad-form-label">Company name *</label>
            <input type="text" className="hr-ad-form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required maxLength={200} />

            <label className="hr-ad-form-label">Location</label>
            <input type="text" className="hr-ad-form-input" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} placeholder="e.g. Cape Town, Remote" />

            <label className="hr-ad-form-label">Job type</label>
            <select className="hr-ad-form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value="">Select…</option>
              {JOB_TYPES.map((jt) => (
                <option key={jt} value={jt}>{jt}</option>
              ))}
            </select>

            <label className="hr-ad-form-label">Category</label>
            <input type="text" className="hr-ad-form-input" value={category} onChange={(e) => setCategory(e.target.value)} maxLength={100} placeholder="e.g. IT, Marketing" />

            <label className="hr-ad-form-label">Contact instructions</label>
            <textarea className="hr-ad-form-textarea" value={contactInstructions} onChange={(e) => setContactInstructions(e.target.value)} maxLength={1000} placeholder="How should applicants get in touch?" rows={2} />

            <label className="hr-ad-form-label">How to receive applications</label>
            <select className="hr-ad-form-select" value={enquiryPreference} onChange={(e) => setEnquiryPreference(e.target.value)}>
              {ENQUIRY_PREFERENCES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="hr-ad-form-publish-days">
              <label className="hr-ad-form-label">Publish on these days (1 token = 1 day)</label>
              <p className="hr-ad-form-hint">Select the calendar days your ad should be visible. Days do not need to be consecutive.</p>
              {publishDays.map((day, index) => (
                <div key={index} className="hr-ad-form-day-row">
                  <input type="date" className="hr-ad-form-input" value={day} onChange={(e) => changePublishDay(index, e.target.value)} />
                  <button type="button" onClick={() => removePublishDay(index)} className="hr-ad-form-remove-day">Remove</button>
                </div>
              ))}
              <button type="button" onClick={addPublishDay} className="hr-ad-form-add-day">+ Add day</button>
              {publishDays.length > 0 && <p className="hr-ad-form-token-hint">Tokens needed to publish: {publishDays.length}</p>}
            </div>

            <div className="hr-ad-form-actions">
              <button type="submit" className="hr-ad-form-btn primary" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save as draft'}</button>
              {isEdit && (
                <button type="button" onClick={handlePublish} className="hr-ad-form-btn publish" disabled={publishing || publishDays.length === 0}>
                  {publishing ? 'Publishing…' : `Publish (${publishDays.length} token${publishDays.length !== 1 ? 's' : ''})`}
                </button>
              )}
              <Link to="/app/hr-classified-ads" className="hr-ad-form-btn secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default HRClassifiedAdForm;
