import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../api/api';
import './ClassifiedAdDetailPage.css';

const ClassifiedAdDetailPage = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [includeCv, setIncludeCv] = useState(true);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/api/classified-ads/active/${id}`);
        if (!cancelled) setAd(data);
      } catch (err) {
        if (!cancelled) {
          const res = err.response;
          if (res?.status === 403 && res?.data?.code === 'CLASSIFIED_ADS_OPT_IN_REQUIRED') {
            setError('opt_in_required');
          } else {
            setError(res?.status === 404 ? 'Ad not found' : (res?.data?.error || 'Failed to load ad'));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError(null);
    setApplySubmitting(true);
    try {
      await api.post(`/api/classified-ads/active/${id}/enquiries`, { message: applyMessage.trim(), includeCv });
      setApplySubmitted(true);
      setApplyMessage('');
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Failed to send application');
    } finally {
      setApplySubmitting(false);
    }
  };

  if (loading) return <div className="classified-ad-detail-page"><div className="classified-ad-detail-container"><p>Loading…</p></div></div>;
  if (error || !ad) {
    return (
      <div className="classified-ad-detail-page">
        <div className="classified-ad-detail-container">
          {error === 'opt_in_required' ? (
            <>
              <p className="classified-ad-detail-error">Turn on job listings in your dashboard to view this ad.</p>
              <Link to="/app/dashboard" className="classified-ad-detail-back">Go to Dashboard →</Link>
            </>
          ) : (
            <>
              <p className="classified-ad-detail-error">{error || 'Ad not found'}</p>
              <Link to="/app/classified-ads" className="classified-ad-detail-back">← Back to job listings</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="classified-ad-detail-page">
      <div className="classified-ad-detail-container">
        <Link to="/app/classified-ads" className="classified-ad-detail-back">← Job listings</Link>
        <article className="classified-ad-detail">
          <h1 className="classified-ad-detail-title">{ad.title}</h1>
          <p className="classified-ad-detail-meta">{ad.companyName}{ad.location ? ` · ${ad.location}` : ''}</p>
          {(ad.jobType || ad.category) && (
            <p className="classified-ad-detail-tags">{[ad.jobType, ad.category].filter(Boolean).join(' · ')}</p>
          )}
          {ad.publishedAt && <p className="classified-ad-detail-date">Posted {formatDate(ad.publishedAt)}</p>}
          <div className="classified-ad-detail-description">
            {ad.description}
          </div>
          {ad.contactInstructions && (
            <div className="classified-ad-detail-contact">
              <h3>How to apply</h3>
              <p>{ad.contactInstructions}</p>
            </div>
          )}
          <div className="classified-ad-detail-apply">
            <h3>Apply for this job</h3>
            {applySubmitted ? (
              <p className="classified-ad-detail-apply-success">Application sent. The employer may contact you via the details in your profile.</p>
            ) : (
              <form onSubmit={handleApplySubmit}>
                <label className="classified-ad-detail-apply-label">Your message *</label>
                <textarea
                  className="classified-ad-detail-apply-textarea"
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  required
                  maxLength={2000}
                  placeholder="Introduce yourself and why you're interested..."
                  rows={4}
                />
                <label className="classified-ad-detail-apply-checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeCv}
                    onChange={(e) => setIncludeCv(e.target.checked)}
                    className="classified-ad-detail-apply-checkbox"
                  />
                  Include my CV with this application
                </label>
                {applyError && <p className="classified-ad-detail-apply-error">{applyError}</p>}
                <button type="submit" className="classified-ad-detail-apply-btn" disabled={applySubmitting}>
                  {applySubmitting ? 'Sending…' : 'Send application'}
                </button>
              </form>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default ClassifiedAdDetailPage;
