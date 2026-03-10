import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../api/api';
import DashboardHeader from '../Dashboard/DashboardHeader';
import '../Dashboard/Dashboard.css';
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
  const [myEnquiry, setMyEnquiry] = useState(null);
  const [myEnquiryLoading, setMyEnquiryLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
          if (
            res?.status === 403 &&
            res?.data?.code === 'CLASSIFIED_ADS_OPT_IN_REQUIRED'
          ) {
            setError('opt_in_required');
          } else {
            setError(
              res?.status === 404
                ? 'Ad not found'
                : res?.data?.error || 'Failed to load ad'
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !ad) return;
    let cancelled = false;
    setMyEnquiryLoading(true);
    setMyEnquiry(null);
    (async () => {
      try {
        const { data } = await api.get(`/api/classified-ads/active/${id}/my-enquiry`);
        if (!cancelled) {
          setMyEnquiry(data);
          setApplyMessage(data.message || '');
          setIncludeCv(data.includeCv !== false);
        }
      } catch (err) {
        if (!cancelled && err.response?.status !== 404) {
          setApplyError(err.response?.data?.error || 'Failed to load application status');
        }
      } finally {
        if (!cancelled) setMyEnquiryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, ad]);

  const formatDate = d =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';

  const handleApplySubmit = async e => {
    e.preventDefault();
    setApplyError(null);
    setApplySubmitting(true);
    try {
      const { data } = await api.post(`/api/classified-ads/active/${id}/enquiries`, {
        message: applyMessage.trim(),
        includeCv,
      });
      setApplySubmitted(true);
      setMyEnquiry({
        id: data.id,
        message: applyMessage.trim(),
        includeCv,
      });
      setApplyMessage('');
    } catch (err) {
      const res = err.response;
      if (res?.status === 409 && res?.data?.enquiryId) {
        setMyEnquiry({
          id: res.data.enquiryId,
          message: applyMessage.trim(),
          includeCv,
        });
        setApplyError(res.data.error || 'You have already applied to this position.');
      } else {
        setApplyError(res?.data?.error || 'Failed to send application');
      }
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleUpdateSubmit = async e => {
    e.preventDefault();
    if (!myEnquiry?.id) return;
    setApplyError(null);
    setApplySubmitting(true);
    setUpdateSuccess(false);
    try {
      await api.patch(`/api/classified-ads/enquiries/${myEnquiry.id}`, {
        message: applyMessage.trim(),
        includeCv,
      });
      setUpdateSuccess(true);
      setMyEnquiry(prev => prev ? { ...prev, message: applyMessage.trim(), includeCv } : null);
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Failed to update application');
    } finally {
      setApplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <DashboardHeader />
        <main className="classified-ad-detail-page">
          <div className="classified-ad-detail-container">
            <div className="classified-ad-detail-header">
              <Link
                to="/app/classified-ads"
                className="classified-ad-detail-back-btn"
              >
                ← Back
              </Link>
              <div className="classified-ad-detail-header-title-wrap">
                <h1 className="classified-ad-detail-header-title">
                  Job listing
                </h1>
                <p className="classified-ad-detail-header-subtitle">Loading…</p>
              </div>
              <div
                className="classified-ad-detail-header-spacer"
                aria-hidden="true"
              />
            </div>
            <div className="classified-ad-detail-loading-card">
              <p>Loading…</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="dashboard">
        <DashboardHeader />
        <main className="classified-ad-detail-page">
          <div className="classified-ad-detail-container">
            <div className="classified-ad-detail-header">
              <Link
                to="/app/classified-ads"
                className="classified-ad-detail-back-btn"
              >
                ← Back
              </Link>
              <div className="classified-ad-detail-header-title-wrap">
                <h1 className="classified-ad-detail-header-title">
                  Job listing
                </h1>
                <p className="classified-ad-detail-header-subtitle">
                  Something went wrong
                </p>
              </div>
              <div
                className="classified-ad-detail-header-spacer"
                aria-hidden="true"
              />
            </div>
            <div className="classified-ad-detail">
              {error === 'opt_in_required' ? (
                <>
                  <p className="classified-ad-detail-error">
                    Turn on job listings in your dashboard to view this ad.
                  </p>
                  <Link
                    to="/app/dashboard"
                    className="classified-ad-detail-cta-link"
                  >
                    Go to Dashboard →
                  </Link>
                </>
              ) : (
                <>
                  <p className="classified-ad-detail-error">
                    {error || 'Ad not found'}
                  </p>
                  <Link
                    to="/app/classified-ads"
                    className="classified-ad-detail-cta-link"
                  >
                    ← Back to job listings
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <DashboardHeader />
      <main className="classified-ad-detail-page">
        <div className="classified-ad-detail-container">
          <div className="classified-ad-detail-header">
            <Link
              to="/app/classified-ads"
              className="classified-ad-detail-back-btn"
            >
              ← Back
            </Link>
            <div className="classified-ad-detail-header-title-wrap">
              <h1 className="classified-ad-detail-header-title">Job listing</h1>
              <p className="classified-ad-detail-header-subtitle">{ad.title}</p>
            </div>
            <div
              className="classified-ad-detail-header-spacer"
              aria-hidden="true"
            />
          </div>
          <article className="classified-ad-detail">
            <h1 className="classified-ad-detail-title">{ad.title}</h1>
            <p className="classified-ad-detail-meta">
              {ad.companyName}
              {ad.location ? ` · ${ad.location}` : ''}
            </p>
            {(ad.jobType || ad.category) && (
              <p className="classified-ad-detail-tags">
                {[ad.jobType, ad.category].filter(Boolean).join(' · ')}
              </p>
            )}
            {ad.publishedAt && (
              <p className="classified-ad-detail-date">
                Posted {formatDate(ad.publishedAt)}
              </p>
            )}
            <div className="classified-ad-detail-description">
              {ad.description}
            </div>
            {ad.contactInstructions && (
              <div className="classified-ad-detail-contact">
                <h3>Application instructions</h3>
                <p>{ad.contactInstructions}</p>
              </div>
            )}
            <div className="classified-ad-detail-apply">
              <h3>Apply for this job</h3>
              {myEnquiry ? (
                <>
                  {applySubmitted && !updateSuccess && (
                    <p className="classified-ad-detail-apply-success">
                      Application sent. The employer may contact you via the details in your profile.
                    </p>
                  )}
                  <p className="classified-ad-detail-apply-already">
                    You have already applied to this position. You can update your message below.
                  </p>
                  {updateSuccess && (
                    <p className="classified-ad-detail-apply-success">
                      Application updated.
                    </p>
                  )}
                  <form onSubmit={handleUpdateSubmit}>
                    <label className="classified-ad-detail-apply-label">
                      Your message *
                    </label>
                    <textarea
                      className="classified-ad-detail-apply-textarea"
                      value={applyMessage}
                      onChange={e => setApplyMessage(e.target.value)}
                      required
                      maxLength={2000}
                      placeholder="Introduce yourself and why you're interested..."
                      rows={4}
                    />
                    <label className="classified-ad-detail-apply-checkbox-label">
                      <input
                        type="checkbox"
                        checked={includeCv}
                        onChange={e => setIncludeCv(e.target.checked)}
                        className="classified-ad-detail-apply-checkbox"
                      />
                      Include my CV with this application
                    </label>
                    {applyError && (
                      <p className="classified-ad-detail-apply-error">
                        {applyError}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="classified-ad-detail-apply-btn"
                      disabled={applySubmitting}
                    >
                      {applySubmitting ? 'Updating…' : 'Update application'}
                    </button>
                  </form>
                </>
              ) : applySubmitted ? (
                <p className="classified-ad-detail-apply-success">
                  Application sent. The employer may contact you via the details
                  in your profile.
                </p>
              ) : (
                <form onSubmit={handleApplySubmit}>
                  <label className="classified-ad-detail-apply-label">
                    Your message *
                  </label>
                  <textarea
                    className="classified-ad-detail-apply-textarea"
                    value={applyMessage}
                    onChange={e => setApplyMessage(e.target.value)}
                    required
                    maxLength={2000}
                    placeholder="Introduce yourself and why you're interested..."
                    rows={4}
                  />
                  <label className="classified-ad-detail-apply-checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeCv}
                      onChange={e => setIncludeCv(e.target.checked)}
                      className="classified-ad-detail-apply-checkbox"
                    />
                    Include my CV with this application
                  </label>
                  {applyError && (
                    <p className="classified-ad-detail-apply-error">
                      {applyError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="classified-ad-detail-apply-btn"
                    disabled={applySubmitting || myEnquiryLoading}
                  >
                    {applySubmitting ? 'Sending…' : 'Send application'}
                  </button>
                </form>
              )}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default ClassifiedAdDetailPage;
