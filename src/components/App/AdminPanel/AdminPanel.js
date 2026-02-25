import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as AdvertisementContext } from '../../../context/AdvertisementContext';
import { Context as ClassifiedAdsContext } from '../../../context/ClassifiedAdsContext';
import api from '../../../api/api';
import { COUNTRIES } from '../../../utils/countryConfig';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();

  const {
    state: { user },
  } = useContext(AuthContext);

  const {
    state: { bannerAdStripShow },
    setBannerAdStripShow,
  } = useContext(AdvertisementContext);

  const {
    state: { classifiedAdsActive },
    setClassifiedAdsActive,
  } = useContext(ClassifiedAdsContext);

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Email form state
  const [emailForm, setEmailForm] = useState({
    template: 'adminCommunicationTemplate',
    subject: '',
    message: '',
    messagePreset: 'preset1',
    recipients: {
      regular: false,
      hr: false,
      marketing: [],
      all: false,
    },
    marketingEmails: '', // Comma or newline separated
    marketingEnabled: false, // Separate state to control marketing checkbox
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [showEmailStats, setShowEmailStats] = useState(false);
  const [templateHint, setTemplateHint] = useState('');
  const [firstImpressionModal, setFirstImpressionModal] = useState(null);
  const [affiliateModalUser, setAffiliateModalUser] = useState(null);
  const [affiliateCodeInput, setAffiliateCodeInput] = useState('');
  const [creatingAffiliate, setCreatingAffiliate] = useState(false);
  const [affiliateModalError, setAffiliateModalError] = useState('');
  const [affiliateInfoModalEmail, setAffiliateInfoModalEmail] = useState(null);
  const [affiliateInfoData, setAffiliateInfoData] = useState(null);
  const [affiliateInfoLoading, setAffiliateInfoLoading] = useState(false);
  const [affiliateInfoError, setAffiliateInfoError] = useState('');
  // Classified Ads: credit tokens to HR user
  const [tokenCreditUserId, setTokenCreditUserId] = useState('');
  const [tokenCreditAmount, setTokenCreditAmount] = useState('');
  const [tokenCreditSubmitting, setTokenCreditSubmitting] = useState(false);
  const [tokenCreditMessage, setTokenCreditMessage] = useState('');

  const PROMO_MESSAGE_PRESETS = React.useMemo(
    () => ({
      preset1:
        `<p>CVs tell you <strong>what</strong> a candidate has done — but not always <strong>who</strong> they are.</p>` +
        `<p><strong>First Impression</strong>, a feature in <strong>CV Cloud</strong>, allows job applicants to attach a <strong>30-second introduction video</strong> to their CV, giving you instant insight into their communication skills, confidence, and personality — before the interview stage.</p>` +
        `<h3>Why recruiters use First Impression:</h3>` +
        `<ul>` +
        `<li>Faster, more effective shortlisting</li>` +
        `<li>Early insight into communication and professionalism</li>` +
        `<li>Better-quality candidates reaching interview stage</li>` +
        `</ul>` +
        `<p>Many recruiters are now <strong>requiring a First Impression video</strong> as part of the application process to save time and improve hiring decisions.</p>`,
      preset2:
        `<p>Dear Hiring Professional,</p>` +
        `<p><strong>CV Cloud</strong> introduces <strong>First Impression</strong>, a feature designed specifically for recruiters and HR teams who want faster, more informed shortlisting.</p>` +
        `<p>With <em>First Impression</em>, job applicants record a <strong>30-second video</strong> where they briefly introduce themselves, highlight their experience, and share what makes them a strong fit for the role. This video is attached directly to their CV and shared with you through CV Cloud.</p>` +
        `<h3>Why recruiters are finding value in <em>First Impression</em>:</h3>` +
        `<ul>` +
        `<li><strong>Save time</strong> — quickly filter candidates before scheduling interviews</li>` +
        `<li><strong>Assess communication skills early</strong> — confidence, clarity, and professionalism matter</li>` +
        `<li><strong>Add human context to a CV</strong> — go beyond paper qualifications</li>` +
        `<li><strong>Improve hiring quality</strong> — shortlist candidates who truly stand out</li>` +
        `</ul>` +
        `<p>Many recruiters are now <strong>requiring a First Impression video</strong> as part of the application process to streamline screening and improve candidate quality from the start.</p>` +
        `<p>If you’re looking for a smarter, more human way to evaluate candidates — <em>First Impression</em> helps you see more, sooner.</p>` +
        `<p>We’d love to help you modernise your hiring process with CV Cloud.</p>`,
    }),
    []
  );

  const JOB_SEEKER_DEFAULT_MESSAGE =
    `<p>Hi there,</p>` +
    `<p>Applying for jobs shouldn’t mean blending in with hundreds of other CVs.</p>` +
    `<p><strong>CV Cloud</strong> is a <strong>free, simple way to create and share your CV</strong>, all in one place. And with our <strong>First Impression</strong> feature, you can take it one step further.</p>` +
    `<p><strong>First Impression</strong> lets you record a <strong>30-second video</strong> introducing yourself — your skills, your goals, and what makes <em>you</em> the right fit. It gives employers a real sense of who you are, not just what’s written on paper.</p>` +
    `<h3>Why it gives you an advantage:</h3>` +
    `<ul>` +
    `<li>You stand out instantly</li>` +
    `<li>Employers see your confidence and communication skills</li>` +
    `<li>You make a strong impression <em>before</em> the interview</li>` +
    `</ul>` +
    `<p>Many recruiters are starting to <strong>expect</strong> First Impression videos — don’t get left behind.</p>` +
    `<p>Create your CV. Add your First Impression. Get noticed.</p>` +
    `<p><strong>CV Cloud — free, easy, and built to help you stand out.</strong></p>`;

  const applyPromoMessagePreset = (presetKey) => {
    const presetHtml = PROMO_MESSAGE_PRESETS[presetKey] || '';

    setEmailForm(prev => ({
      ...prev,
      messagePreset: presetKey,
      message: presetHtml,
    }));
  };

  useEffect(() => {
    fetchUsers();
    fetchPlatformStats();
    fetchActivityStats();
    fetchEmailCampaigns();
  }, []);

  useEffect(() => {
    if (!firstImpressionModal) return;
    const onEscape = (e) => {
      if (e.key === 'Escape') setFirstImpressionModal(null);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [firstImpressionModal]);

  useEffect(() => {
    if (!affiliateModalUser) return;
    const onEscape = (e) => {
      if (e.key === 'Escape') setAffiliateModalUser(null);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [affiliateModalUser]);

  useEffect(() => {
    if (!affiliateInfoModalEmail) return;
    const onEscape = (e) => {
      if (e.key === 'Escape') setAffiliateInfoModalEmail(null);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [affiliateInfoModalEmail]);

  useEffect(() => {
    if (!affiliateInfoModalEmail) {
      setAffiliateInfoData(null);
      setAffiliateInfoError('');
      return;
    }
    let cancelled = false;
    setAffiliateInfoLoading(true);
    setAffiliateInfoError('');
    setAffiliateInfoData(null);
    api
      .post('/auth/user/fetch-affiliate-info', { userEmail: affiliateInfoModalEmail })
      .then((response) => {
        if (cancelled) return;
        if (response.data && response.data.error) {
          setAffiliateInfoError(response.data.error);
          setAffiliateInfoData(null);
        } else {
          setAffiliateInfoData(response.data);
          setAffiliateInfoError('');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAffiliateInfoError(
            err.response?.data?.error || 'Failed to load affiliate info'
          );
          setAffiliateInfoData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setAffiliateInfoLoading(false);
      });
    return () => { cancelled = true; };
  }, [affiliateInfoModalEmail]);

  const openAffiliateModal = (u) => {
    setAffiliateModalUser({ email: u.email, _id: u._id });
    setAffiliateCodeInput('');
    setAffiliateModalError('');
  };

  const closeAffiliateModal = () => {
    setAffiliateModalUser(null);
    setAffiliateCodeInput('');
    setAffiliateModalError('');
  };

  const handleCreateAffiliate = async () => {
    const code = affiliateCodeInput.trim();
    if (!code) {
      setAffiliateModalError('Please enter an affiliate code');
      return;
    }
    setCreatingAffiliate(true);
    setAffiliateModalError('');
    try {
      const response = await api.patch('/auth/user/create-affiliate', {
        userEmail: affiliateModalUser.email,
        code,
      });
      if (response.data.error) {
        setAffiliateModalError(response.data.error);
        return;
      }
      setSuccess(
        response.data.code
          ? `Affiliate created. Code: ${response.data.code}`
          : response.data.success || 'Affiliate created successfully'
      );
      setTimeout(() => setSuccess(''), 5000);
      closeAffiliateModal();
      fetchUsers();
    } catch (err) {
      setAffiliateModalError(
        err.response?.data?.error || 'Failed to create affiliate'
      );
    } finally {
      setCreatingAffiliate(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users);
      setStats(response.data.stats);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setPlatformStats(response.data);
    } catch (err) {
      console.error('Error fetching platform stats:', err);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await api.get('/api/user-activity/stats?days=30');
      setActivityStats(response.data);
    } catch (err) {
      console.error('Error fetching activity stats:', err);
    }
  };

  const fetchEmailCampaigns = async () => {
    try {
      const response = await api.get('/api/admin/email-tracking/stats');
      // Debug: raw data from backend (open/click counts come from EmailCampaign + tracking)
      console.log('[AdminPanel] email-tracking/stats response:', response.data);
      console.log('[AdminPanel] campaigns (recent):', response.data.campaigns?.slice(0, 10));
      setEmailCampaigns(response.data.campaigns || []);
    } catch (err) {
      console.error('Error fetching email campaigns:', err);
    }
  };

  const handleEmailFormChange = (field, value) => {
    if (field.startsWith('recipients.')) {
      const recipientField = field.split('.')[1];
      setEmailForm(prev => ({
        ...prev,
        recipients: {
          ...prev.recipients,
          [recipientField]: value,
        },
      }));
    } else {
      setEmailForm(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleTemplateChange = (value) => {
    setEmailForm(prev => ({
      ...prev,
      template: value,
    }));

    if (value === 'firstImpressionPromoTemplate') {
      setTemplateHint(
        "Uses the built-in 'First Impression' promo layout (includes demo video + HR intro links automatically)."
      );

      setEmailForm(prev => {
        const next = { ...prev, template: value };

        if (!next.subject) {
          next.subject =
            'Would a 30-second video change how you shortlist candidates?';
        }
        if (!next.message) {
          const presetHtml = PROMO_MESSAGE_PRESETS[next.messagePreset || 'preset1'];
          next.message = presetHtml || '';
        }

        // If nothing is selected yet, default to HR (promo is HR-targeted)
        const anySelected =
          next.recipients.all ||
          next.recipients.regular ||
          next.recipients.hr ||
          (next.marketingEnabled && next.recipients.marketing.length > 0);

        if (!anySelected && !next.recipients.all) {
          next.recipients = {
            ...next.recipients,
            hr: true,
          };
        }

        return next;
      });
    } else if (value === 'firstImpressionJobSeekerPromoTemplate') {
      setTemplateHint(
        "Job seeker promo layout (includes a CTA to create your free CV)."
      );

      setEmailForm(prev => {
        const next = { ...prev, template: value };

        if (!next.subject) {
          next.subject = 'Stand out before the interview — in 30 seconds';
        }
        if (!next.message) {
          next.message = JOB_SEEKER_DEFAULT_MESSAGE;
        }

        // If nothing is selected yet, default to regular users (job-seeker promo)
        const anySelected =
          next.recipients.all ||
          next.recipients.regular ||
          next.recipients.hr ||
          (next.marketingEnabled && next.recipients.marketing.length > 0);

        if (!anySelected && !next.recipients.all) {
          next.recipients = {
            ...next.recipients,
            regular: true,
          };
        }

        return next;
      });
    } else {
      setTemplateHint('');
    }
  };

  const handleMarketingEmailsChange = (value) => {
    setEmailForm(prev => ({
      ...prev,
      marketingEmails: value,
    }));
    
    // Parse emails from textarea (comma or newline separated)
    const emails = value
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    setEmailForm(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        marketing: emails,
      },
    }));
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      setError('Subject and message are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const hasRecipients = 
      emailForm.recipients.regular || 
      emailForm.recipients.hr || 
      (emailForm.marketingEnabled && emailForm.recipients.marketing.length > 0) || 
      emailForm.recipients.all;

    if (!hasRecipients) {
      setError('Please select at least one recipient type');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setSendingEmail(true);
      setError('');
      
      const response = await api.post('/api/admin/send-email', {
        template: emailForm.template,
        subject: emailForm.subject,
        message: emailForm.message,
        recipients: emailForm.recipients,
      });

      setSuccess(`Email sent successfully! Sent to ${response.data.campaign.totalSent} recipients.`);
      setTimeout(() => setSuccess(''), 5000);
      
      // Reset form
      setEmailForm({
        template: 'adminCommunicationTemplate',
        subject: '',
        message: '',
        messagePreset: 'preset1',
        recipients: {
          regular: false,
          hr: false,
          marketing: [],
          all: false,
        },
        marketingEmails: '',
        marketingEnabled: false,
      });
      
      // Refresh campaigns
      fetchEmailCampaigns();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleUpdateTier = async (userId, newTier) => {
    try {
      await api.patch(`/api/admin/users/${userId}/tier`, { tier: newTier });
      setSuccess(`User tier updated to ${newTier}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user tier');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleAds = async () => {
    const newValue = !bannerAdStripShow;

    try {
      // Save to database
      await api.patch('/api/admin/settings', {
        bannerAdStripShow: newValue,
      });

      // Update local state
      setBannerAdStripShow(newValue);
      setSuccess(`Ads ${newValue ? 'enabled' : 'disabled'} globally`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update ad settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleClassifiedAds = async () => {
    const newValue = !classifiedAdsActive;
    try {
      await api.patch('/api/admin/settings', { classifiedAdsActive: newValue });
      setClassifiedAdsActive(newValue);
      setSuccess(`Job listings ${newValue ? 'enabled' : 'disabled'} globally`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update job listings setting');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreditTokens = async (e) => {
    e.preventDefault();
    const userId = tokenCreditUserId.trim();
    const amount = parseInt(tokenCreditAmount, 10);
    if (!userId || !Number.isInteger(amount) || amount < 1) {
      setTokenCreditMessage('Select an HR user and enter a positive number of tokens.');
      setTimeout(() => setTokenCreditMessage(''), 4000);
      return;
    }
    setTokenCreditMessage('');
    setTokenCreditSubmitting(true);
    try {
      const { data } = await api.post('/api/classified-ads/tokens/credit', {
        userId,
        amount,
        reason: 'admin_credit',
      });
      setTokenCreditMessage(`Credited ${amount} token(s). New balance: ${data.balance}`);
      setTokenCreditAmount('');
      setTimeout(() => setTokenCreditMessage(''), 5000);
    } catch (err) {
      setTokenCreditMessage(err.response?.data?.error || 'Failed to credit tokens');
      setTimeout(() => setTokenCreditMessage(''), 5000);
    } finally {
      setTokenCreditSubmitting(false);
    }
  };

  // Calculate country distribution
  const countryStats = users.reduce((acc, u) => {
    const country = u.country || 'ZA';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  // Sort countries by user count (descending)
  const topCountries = Object.entries(countryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 countries

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || u.tier === filterTier;
    const matchesType =
      filterType === 'all' ||
      (filterType === 'regular' && !u.HR && !u.isAdmin) ||
      (filterType === 'hr' && u.HR) ||
      (filterType === 'admin' && u.isAdmin);

    return matchesSearch && matchesTier && matchesType;
  });

  if (!user?.isAdmin) {
    return (
      <div className="admin-panel">
        <div className="admin-unauthorized">
          <h1>🚫 Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-container">
        <div className="admin-panel-header">
          <div className="admin-header-title">
            <h1>👑 Admin Panel</h1>
            <p>Manage platform settings and users</p>
          </div>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="admin-btn-back"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && <div className="admin-success-message">{success}</div>}
        {error && <div className="admin-error-message">{error}</div>}

        {/* Job listings / Classified ads feature toggle */}
        <div className="admin-section">
          <h2>📋 Job listings / Classified ads</h2>
          <div className="admin-ad-controls">
            <div className="admin-ad-status">
              <span className="admin-ad-label">Feature:</span>
              <span
                className={`admin-ad-badge ${classifiedAdsActive ? 'active' : 'inactive'}`}
              >
                {classifiedAdsActive ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
            <button onClick={handleToggleClassifiedAds} className="admin-btn-toggle-ads">
              {classifiedAdsActive ? '🚫 Disable job listings' : '✅ Enable job listings'}
            </button>
            <div className="admin-ad-note">
              When disabled, job listings, tokens, and My Ads are hidden in the web and mobile apps.
            </div>
          </div>
        </div>

        {/* Credit tokens (Classified Ads / Job listings) — only when feature is on */}
        {classifiedAdsActive && (
        <div className="admin-section">
          <h2>🪙 Credit job listing tokens</h2>
          <p className="admin-section-description">
            Add tokens to an HR user so they can publish classified ads. One token = one day of visibility per ad.
          </p>
          <form onSubmit={handleCreditTokens} className="admin-token-credit-form">
            <div className="admin-token-credit-row">
              <label htmlFor="token-credit-user">HR user</label>
              <select
                id="token-credit-user"
                value={tokenCreditUserId}
                onChange={(e) => setTokenCreditUserId(e.target.value)}
                required
                className="admin-token-credit-select"
              >
                <option value="">Select HR user…</option>
                {users.filter((u) => u.HR).map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.email || u.username || u._id}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-token-credit-row">
              <label htmlFor="token-credit-amount">Amount (tokens)</label>
              <input
                id="token-credit-amount"
                type="number"
                min="1"
                step="1"
                value={tokenCreditAmount}
                onChange={(e) => setTokenCreditAmount(e.target.value)}
                placeholder="e.g. 10"
                className="admin-token-credit-input"
              />
            </div>
            <div className="admin-token-credit-row">
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={tokenCreditSubmitting}
              >
                {tokenCreditSubmitting ? 'Crediting…' : 'Credit tokens'}
              </button>
            </div>
            {tokenCreditMessage && (
              <div className={tokenCreditMessage.startsWith('Credited') ? 'admin-token-credit-success' : 'admin-token-credit-error'}>
                {tokenCreditMessage}
              </div>
            )}
          </form>
        </div>
        )}

        {/* Platform Stats */}
        {platformStats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon">👥</div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">
                  {platformStats.users.total}
                </div>
                <div className="admin-stat-label">Total Users</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon">🌟</div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">
                  {platformStats.users.premium}
                </div>
                <div className="admin-stat-label">Premium Users</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon">💼</div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">{platformStats.users.hr}</div>
                <div className="admin-stat-label">HR Users</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon">📄</div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">
                  {platformStats.cvs.public}
                </div>
                <div className="admin-stat-label">Public CVs</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon">🎬</div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">
                  {platformStats.users.firstImpression ?? 0}
                </div>
                <div className="admin-stat-label">Users with First Impression</div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Stats */}
        {activityStats && (
          <div className="admin-section">
            <h2>📊 User Activity (Last 30 Days)</h2>
            <div className="admin-activity-grid">
              <div className="admin-activity-card">
                <div className="admin-activity-icon">📅</div>
                <div className="admin-activity-content">
                  <div className="admin-activity-value">
                    {activityStats.activeUsers?.daily || 0}
                  </div>
                  <div className="admin-activity-label">Active Today</div>
                </div>
              </div>
              <div className="admin-activity-card">
                <div className="admin-activity-icon">📆</div>
                <div className="admin-activity-content">
                  <div className="admin-activity-value">
                    {activityStats.activeUsers?.weekly || 0}
                  </div>
                  <div className="admin-activity-label">Active This Week</div>
                </div>
              </div>
              <div className="admin-activity-card">
                <div className="admin-activity-icon">📈</div>
                <div className="admin-activity-content">
                  <div className="admin-activity-value">
                    {activityStats.activeUsers?.monthly || 0}
                  </div>
                  <div className="admin-activity-label">Active This Month</div>
                </div>
              </div>
            </div>

            {/* Top Actions */}
            {activityStats.actionStats &&
              activityStats.actionStats.length > 0 && (
                <div className="admin-top-actions">
                  <h3>🎯 Top User Actions</h3>
                  <div className="admin-actions-list">
                    {activityStats.actionStats
                      .slice(0, 5)
                      .map((stat, index) => (
                        <div key={stat._id} className="admin-action-item">
                          <span className="admin-action-rank">
                            #{index + 1}
                          </span>
                          <span className="admin-action-name">
                            {stat._id
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="admin-action-count">
                            {stat.count} times
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Country Distribution */}
        {topCountries.length > 0 && (
          <div className="admin-section">
            <h2>🌍 User Distribution by Country</h2>
            <div className="admin-country-stats">
              {topCountries.map(([countryCode, count]) => {
                const country = COUNTRIES.find(c => c.code === countryCode);
                const percentage = ((count / users.length) * 100).toFixed(1);
                return (
                  <div key={countryCode} className="admin-country-stat-item">
                    <div className="admin-country-stat-header">
                      <span className="admin-country-stat-flag">
                        {country?.flag || '🌍'}
                      </span>
                      <span className="admin-country-stat-name">
                        {country?.name || countryCode}
                      </span>
                    </div>
                    <div className="admin-country-stat-bar">
                      <div
                        className="admin-country-stat-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="admin-country-stat-info">
                      <span className="admin-country-stat-count">
                        {count} users
                      </span>
                      <span className="admin-country-stat-percent">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ad Controls */}
        <div className="admin-section">
          <h2>📢 Advertisement Controls</h2>
          <div className="admin-ad-controls">
            <div className="admin-ad-status">
              <span className="admin-ad-label">Global Ad Status:</span>
              <span
                className={`admin-ad-badge ${bannerAdStripShow ? 'active' : 'inactive'}`}
              >
                {bannerAdStripShow ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
            <button onClick={handleToggleAds} className="admin-btn-toggle-ads">
              {bannerAdStripShow ? '🚫 Disable Ads' : '✅ Enable Ads'}
            </button>
            <div className="admin-ad-note">
              Note: Premium users will never see ads, regardless of this
              setting.
            </div>
          </div>
        </div>

        {/* Email Communication */}
        <div className="admin-section">
          <h2>📧 Email Communication</h2>
          <div className="admin-email-form">
            <div className="admin-email-field">
              <label htmlFor="email-template">Template</label>
              <select
                id="email-template"
                value={emailForm.template}
                onChange={e => handleTemplateChange(e.target.value)}
                className="admin-email-select"
              >
                <option value="adminCommunicationTemplate">
                  Standard (Admin Communication)
                </option>
                <option value="firstImpressionPromoTemplate">
                  Promo: First Impression (HR / Recruiters)
                </option>
                <option value="firstImpressionJobSeekerPromoTemplate">
                  Promo: First Impression (Job Seekers)
                </option>
              </select>
              {templateHint ? (
                <div className="admin-email-hint">{templateHint}</div>
              ) : null}
            </div>

            {emailForm.template === 'firstImpressionPromoTemplate' ? (
              <div className="admin-email-field">
                <label htmlFor="email-message-preset">Message preset</label>
                <div className="admin-email-preset-row">
                  <select
                    id="email-message-preset"
                    value={emailForm.messagePreset}
                    onChange={e => applyPromoMessagePreset(e.target.value)}
                    className="admin-email-select"
                  >
                    <option value="preset1">Preset 1</option>
                    <option value="preset2">Preset 2</option>
                  </select>
                  <button
                    type="button"
                    className="admin-btn-apply-preset"
                    onClick={() => applyPromoMessagePreset(emailForm.messagePreset)}
                  >
                    Use preset
                  </button>
                </div>
                <div className="admin-email-hint">
                  Tip: “Use preset” will replace the current message with the selected preset.
                </div>
              </div>
            ) : null}

            <div className="admin-email-field">
              <label htmlFor="email-subject">Subject *</label>
              <input
                id="email-subject"
                type="text"
                placeholder="Enter email subject"
                value={emailForm.subject}
                onChange={e => handleEmailFormChange('subject', e.target.value)}
                className="admin-email-input"
              />
            </div>

            <div className="admin-email-field">
              <label htmlFor="email-message">Message *</label>
              <textarea
                id="email-message"
                placeholder="Enter your message here..."
                value={emailForm.message}
                onChange={e => handleEmailFormChange('message', e.target.value)}
                className="admin-email-textarea"
                rows={8}
              />
            </div>

            <div className="admin-email-recipients">
              <label>Recipients *</label>
              <div className="admin-email-checkboxes">
                <label className="admin-email-checkbox">
                  <input
                    type="checkbox"
                    checked={emailForm.recipients.all}
                    onChange={e => {
                      const allChecked = e.target.checked;
                      handleEmailFormChange('recipients.all', allChecked);
                      if (allChecked) {
                        handleEmailFormChange('recipients.regular', false);
                        handleEmailFormChange('recipients.hr', false);
                        setEmailForm(prev => ({
                          ...prev,
                          marketingEnabled: false,
                          marketingEmails: '',
                          recipients: {
                            ...prev.recipients,
                            marketing: [],
                          },
                        }));
                      }
                    }}
                  />
                  <span>All Users</span>
                </label>
                <label className="admin-email-checkbox">
                  <input
                    type="checkbox"
                    checked={emailForm.recipients.regular}
                    onChange={e => {
                      handleEmailFormChange('recipients.regular', e.target.checked);
                      if (e.target.checked) {
                        handleEmailFormChange('recipients.all', false);
                      }
                    }}
                    disabled={emailForm.recipients.all}
                  />
                  <span>Regular Users</span>
                </label>
                <label className="admin-email-checkbox">
                  <input
                    type="checkbox"
                    checked={emailForm.recipients.hr}
                    onChange={e => {
                      handleEmailFormChange('recipients.hr', e.target.checked);
                      if (e.target.checked) {
                        handleEmailFormChange('recipients.all', false);
                      }
                    }}
                    disabled={emailForm.recipients.all}
                  />
                  <span>HR Users</span>
                </label>
                <label className="admin-email-checkbox">
                  <input
                    type="checkbox"
                    checked={emailForm.marketingEnabled}
                    onChange={e => {
                      const isChecked = e.target.checked;
                      setEmailForm(prev => ({
                        ...prev,
                        marketingEnabled: isChecked,
                      }));
                      if (!isChecked) {
                        // Clear marketing emails when unchecked
                        handleMarketingEmailsChange('');
                      }
                    }}
                    disabled={emailForm.recipients.all}
                  />
                  <span>Marketing (Manual Emails)</span>
                </label>
              </div>

              {emailForm.marketingEnabled ? (
                <div className="admin-email-marketing-input">
                  <label htmlFor="marketing-emails">
                    Marketing Email Addresses (comma or newline separated)
                  </label>
                  <textarea
                    id="marketing-emails"
                    placeholder="email1@example.com, email2@example.com&#10;email3@example.com"
                    value={emailForm.marketingEmails}
                    onChange={e => handleMarketingEmailsChange(e.target.value)}
                    className="admin-email-textarea"
                    rows={4}
                    disabled={emailForm.recipients.all}
                  />
                  {emailForm.recipients.marketing.length > 0 && (
                    <div className="admin-email-marketing-count">
                      {emailForm.recipients.marketing.length} email(s) entered
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail || !emailForm.subject || !emailForm.message}
              className="admin-btn-send-email"
            >
              {sendingEmail ? '⏳ Sending...' : '📤 Send Email'}
            </button>
          </div>

          {/* Email Campaign Stats */}
          {emailCampaigns.length > 0 && (
            <div className="admin-email-stats">
              <div className="admin-email-stats-header">
                <h3>📊 Recent Email Campaigns</h3>
                <button
                  onClick={() => setShowEmailStats(!showEmailStats)}
                  className="admin-btn-toggle-stats"
                >
                  {showEmailStats ? 'Hide Stats' : 'Show Stats'}
                </button>
              </div>
              {showEmailStats && (
                <div className="admin-email-campaigns-list">
                  {emailCampaigns.slice(0, 10).map(campaign => (
                    <div key={campaign.id} className="admin-email-campaign-item">
                      <div className="admin-email-campaign-subject">{campaign.subject}</div>
                      <div className="admin-email-campaign-meta">
                        <span>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>
                        <span>Recipients: {campaign.totalSent}</span>
                        <span>Opened: {campaign.totalOpened} ({campaign.openRate}%)</span>
                        <span>Clicked: {campaign.totalClicked} ({campaign.clickRate}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="admin-section">
          <h2>👥 User Management</h2>

          {/* Filters */}
          <div className="admin-filters">
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Types</option>
              <option value="regular">Regular</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* User Stats */}
          {stats && (
            <div className="admin-user-stats">
              <span>Total: {stats.total}</span>
              <span>Regular: {stats.regular}</span>
              <span>HR: {stats.hr}</span>
              <span>Free: {stats.free}</span>
              <span>Premium: {stats.premium}</span>
            </div>
          )}

          {/* Users Table */}
          {loading ? (
            <div className="admin-loading">Loading users...</div>
          ) : (
            <div className="admin-users-table">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Date Signed Up</th>
                    <th>Country</th>
                    <th>Type</th>
                    <th>Tier</th>
                    <th>Ads</th>
                    <th>Affiliate</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="admin-user-email">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt=""
                              className="admin-user-avatar"
                            />
                          ) : (
                            <span className="admin-user-avatar-initials">
                              {(u.email || '?')
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                          <span className="admin-user-email-text">
                            {u.email}
                            {u.isAdmin && (
                              <span className="admin-badge">ADMIN</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-date-signed-up">
                          {formatDate(u.created)}
                        </span>
                      </td>
                      <td>
                        <span className="admin-country-badge">
                          {COUNTRIES.find(c => c.code === (u.country || 'ZA'))
                            ?.flag || '🌍'}{' '}
                          {COUNTRIES.find(c => c.code === (u.country || 'ZA'))
                            ?.name ||
                            u.country ||
                            'South Africa'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-type-badge ${u.HR ? 'hr' : 'regular'}`}
                        >
                          {u.isAdmin ? 'Admin' : u.HR ? 'HR' : 'Regular'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-tier-badge ${u.tier}`}>
                          {u.tier || 'free'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-ads-badge ${u.tier === 'premium' ? 'no' : 'yes'}`}
                        >
                          {u.tier === 'premium' ? '✗ No' : '✓ Yes'}
                        </span>
                      </td>
                      <td>
                        {u.affiliate ? (
                          <button
                            type="button"
                            onClick={() => setAffiliateInfoModalEmail(u.email)}
                            className="admin-btn-affiliate-info"
                            title="View affiliate performance"
                          >
                            Affiliate info
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAffiliateModal(u)}
                            className="admin-btn-make-affiliate"
                            title="Make affiliate and assign code"
                          >
                            Make affiliate
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="admin-user-actions">
                          {u.firstImpression?.videoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setFirstImpressionModal({
                                  videoUrl: u.firstImpression.videoUrl,
                                  userEmail: u.email,
                                })
                              }
                              className="admin-btn-play-fi"
                              title="Play First Impression video"
                              aria-label="Play First Impression video"
                            >
                              <svg className="admin-btn-play-fi-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="admin-no-results">
                  No users found matching your filters.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Make affiliate modal */}
        {affiliateModalUser && (
          <div
            className="admin-fi-modal-overlay"
            onClick={closeAffiliateModal}
            role="dialog"
            aria-modal="true"
            aria-label="Make affiliate"
          >
            <div
              className="admin-fi-modal admin-affiliate-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-fi-modal-header">
                <h3>Make affiliate – {affiliateModalUser.email}</h3>
                <button
                  type="button"
                  className="admin-fi-modal-close"
                  onClick={closeAffiliateModal}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="admin-affiliate-modal-body">
                <p className="admin-affiliate-modal-hint">
                  Assign a unique code (2–30 characters, letters and numbers only; case insensitive).
                </p>
                <div className="admin-email-field">
                  <label htmlFor="affiliate-code">Affiliate code *</label>
                  <input
                    id="affiliate-code"
                    type="text"
                    placeholder="e.g. partner1"
                    maxLength={30}
                    value={affiliateCodeInput}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30);
                      setAffiliateCodeInput(v);
                      setAffiliateModalError('');
                    }}
                    className="admin-email-input"
                    autoComplete="off"
                  />
                </div>
                {affiliateModalError && (
                  <div className="admin-error-message admin-affiliate-modal-error">
                    {affiliateModalError}
                  </div>
                )}
                <div className="admin-affiliate-modal-actions">
                  <button
                    type="button"
                    onClick={closeAffiliateModal}
                    className="admin-btn-cancel-affiliate"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAffiliate}
                    disabled={creatingAffiliate || !affiliateCodeInput.trim()}
                    className="admin-btn-submit-affiliate"
                  >
                    {creatingAffiliate ? 'Creating…' : 'Create affiliate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affiliate info (performance) modal */}
        {affiliateInfoModalEmail && (
          <div
            className="admin-fi-modal-overlay"
            onClick={() => setAffiliateInfoModalEmail(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Affiliate info"
          >
            <div
              className="admin-fi-modal admin-affiliate-info-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-fi-modal-header">
                <h3>Affiliate info – {affiliateInfoModalEmail}</h3>
                <button
                  type="button"
                  className="admin-fi-modal-close"
                  onClick={() => setAffiliateInfoModalEmail(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="admin-affiliate-modal-body">
                {affiliateInfoLoading && (
                  <div className="admin-affiliate-info-loading">Loading…</div>
                )}
                {affiliateInfoError && !affiliateInfoLoading && (
                  <div className="admin-error-message admin-affiliate-modal-error">
                    {affiliateInfoError}
                  </div>
                )}
                {affiliateInfoData && !affiliateInfoLoading && (
                  <div className="admin-affiliate-info-grid">
                    <div className="admin-affiliate-info-row">
                      <span className="admin-affiliate-info-label">Code</span>
                      <span className="admin-affiliate-info-value admin-affiliate-info-code">
                        {affiliateInfoData.code}
                      </span>
                    </div>
                    <div className="admin-affiliate-info-row">
                      <span className="admin-affiliate-info-label">Introductions</span>
                      <span className="admin-affiliate-info-value">
                        {affiliateInfoData.introductions ?? 0}
                      </span>
                    </div>
                    <div className="admin-affiliate-info-row">
                      <span className="admin-affiliate-info-label">Name</span>
                      <span className="admin-affiliate-info-value">
                        {affiliateInfoData.name || '—'}
                      </span>
                    </div>
                    <div className="admin-affiliate-info-row">
                      <span className="admin-affiliate-info-label">Email</span>
                      <span className="admin-affiliate-info-value">
                        {affiliateInfoData.email || '—'}
                      </span>
                    </div>
                    <div className="admin-affiliate-info-row">
                      <span className="admin-affiliate-info-label">Phone</span>
                      <span className="admin-affiliate-info-value">
                        {affiliateInfoData.phone || '—'}
                      </span>
                    </div>
                    <div className="admin-affiliate-info-row">
                      <span className="admin-affiliate-info-label">Last update</span>
                      <span className="admin-affiliate-info-value">
                        {affiliateInfoData.lastUpdate
                          ? new Date(affiliateInfoData.lastUpdate).toLocaleString()
                          : '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* First Impression video modal */}
        {firstImpressionModal && (
          <div
            className="admin-fi-modal-overlay"
            onClick={() => setFirstImpressionModal(null)}
            role="dialog"
            aria-modal="true"
            aria-label="First Impression video"
          >
            <div
              className="admin-fi-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-fi-modal-header">
                <h3>First Impression – {firstImpressionModal.userEmail}</h3>
                <button
                  type="button"
                  className="admin-fi-modal-close"
                  onClick={() => setFirstImpressionModal(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="admin-fi-modal-video-wrap">
                <video
                  src={firstImpressionModal.videoUrl}
                  controls
                  playsInline
                  className="admin-fi-modal-video"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
