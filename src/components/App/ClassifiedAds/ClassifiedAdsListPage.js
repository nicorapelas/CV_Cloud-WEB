import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import DashboardHeader from '../Dashboard/DashboardHeader';
import '../Dashboard/Dashboard.css';
import './ClassifiedAdsListPage.css';

const formatPublishDay = (d) => (d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '');

const ClassifiedAdsListPage = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: '', location: '', jobType: '' });
  const [detailModalAdId, setDetailModalAdId] = useState(null);
  const [detailModalAd, setDetailModalAd] = useState(null);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [detailModalError, setDetailModalError] = useState(null);
  const limit = 20;

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit, showAll: '1' });
      if (filters.category) params.set('category', filters.category);
      if (filters.location) params.set('location', filters.location);
      if (filters.jobType) params.set('jobType', filters.jobType);
      const { data } = await api.get(`/api/classified-ads/active?${params.toString()}`);
      setAds(data.ads);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      const res = err.response;
      if (res?.status === 403 && res?.data?.code === 'CLASSIFIED_ADS_OPT_IN_REQUIRED') {
        setError('opt_in_required');
      } else {
        setError(res?.data?.error || 'Failed to load job listings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [page, filters.category, filters.location, filters.jobType]);

  useEffect(() => {
    if (!detailModalAdId) {
      setDetailModalAd(null);
      setDetailModalError(null);
      return;
    }
    let cancelled = false;
    setDetailModalLoading(true);
    setDetailModalError(null);
    api.get(`/api/classified-ads/active/${detailModalAdId}`)
      .then(({ data }) => {
        if (!cancelled) {
          setDetailModalAd(data);
          setDetailModalError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailModalAd(null);
          setDetailModalError(err.response?.data?.error || 'Failed to load details');
        }
      })
      .finally(() => {
        if (!cancelled) setDetailModalLoading(false);
      });
    return () => { cancelled = true; };
  }, [detailModalAdId]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');
  const closeDetailModal = () => setDetailModalAdId(null);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="dashboard">
      <DashboardHeader />
      <main className="classified-ads-list-page">
        <div className="classified-ads-list-container">
        <div className="classified-ads-list-header">
          <button
            type="button"
            className="classified-ads-list-back-btn"
            onClick={() => navigate('/app/dashboard')}
          >
            ← Back
          </button>
          <div className="classified-ads-list-header-title-wrap">
            <h1 className="classified-ads-list-title">Job listings</h1>
            <p className="classified-ads-list-subtitle">Classified ads from employers. Tap an ad to view details and apply.</p>
          </div>
          <div className="classified-ads-list-header-spacer" aria-hidden="true" />
        </div>

        <div className="classified-ads-filters">
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            onBlur={() => setPage(1)}
            className="classified-ads-filter-input"
          />
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
            onBlur={() => setPage(1)}
            className="classified-ads-filter-input"
          />
          <select
            value={filters.jobType}
            onChange={(e) => { setFilters((f) => ({ ...f, jobType: e.target.value })); setPage(1); }}
            className="classified-ads-filter-select"
          >
            <option value="">All job types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="volunteer">Volunteer</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        {error === 'opt_in_required' && (
            <div className="classified-ads-list-opt-in">
              <p>Turn on job listings in your dashboard to see them here.</p>
              <Link to="/app/dashboard" className="classified-ads-list-opt-in-btn">Go to Dashboard →</Link>
            </div>
          )}
{error && error !== 'opt_in_required' && <div className="classified-ads-list-error">{error}</div>}
          {error === 'opt_in_required' ? null : loading ? (
            <div className="classified-ads-list-loading">Loading…</div>
          ) : ads.length === 0 ? (
          <div className="classified-ads-list-empty">No job listings match your filters. Try adjusting or check back later.</div>
        ) : (
          <>
            <ul className="classified-ads-list">
              {ads.map((ad) => (
                <li key={ad._id}>
                  <div className="classified-ads-card">
                    <Link to={`/app/classified-ads/${ad._id}`} className="classified-ads-card-link">
                      <h2 className="classified-ads-card-title">{ad.title}</h2>
                      <p className="classified-ads-card-meta">{ad.companyName}{ad.location ? ` · ${ad.location}` : ''}</p>
                      {(ad.jobType || ad.category) && (
                        <p className="classified-ads-card-tags">
                          {[ad.jobType, ad.category].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {ad.publishedAt && <span className="classified-ads-card-date">Posted {formatDate(ad.publishedAt)}</span>}
                    </Link>
                    <button type="button" className="classified-ads-card-details-btn" onClick={(e) => { e.preventDefault(); setDetailModalAdId(ad._id); }}>
                      Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="classified-ads-pagination">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
              </div>
            )}
          </>
        )}

        {detailModalAdId && (
          <div className="classified-ads-detail-modal-overlay" onClick={closeDetailModal}>
            <div className="classified-ads-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="classified-ads-detail-modal-header">
                <h2 className="classified-ads-detail-modal-title">
                  {detailModalAd ? detailModalAd.title : 'Job details'}
                </h2>
                <button type="button" className="classified-ads-detail-modal-close" onClick={closeDetailModal} aria-label="Close">×</button>
              </div>
              <div className="classified-ads-detail-modal-body">
                {detailModalLoading && <p className="classified-ads-detail-modal-loading">Loading…</p>}
                {detailModalError && <p className="classified-ads-detail-modal-error">{detailModalError}</p>}
                {detailModalAd && !detailModalLoading && (
                  <>
                    <p className="classified-ads-detail-modal-meta">
                      {detailModalAd.companyName}{detailModalAd.location ? ` · ${detailModalAd.location}` : ''}
                    </p>
                    {(detailModalAd.jobType || detailModalAd.category) && (
                      <p className="classified-ads-detail-modal-tags">
                        {[detailModalAd.jobType, detailModalAd.category].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {detailModalAd.publishedAt && (
                      <p className="classified-ads-detail-modal-date">Posted {formatDate(detailModalAd.publishedAt)}</p>
                    )}
                    {detailModalAd.description && (
                      <div className="classified-ads-detail-modal-section">
                        <h4 className="classified-ads-detail-modal-label">Description</h4>
                        <div className="classified-ads-detail-modal-content">{detailModalAd.description}</div>
                      </div>
                    )}
                    {detailModalAd.contactInstructions && (
                      <div className="classified-ads-detail-modal-section">
                        <h4 className="classified-ads-detail-modal-label">How to apply</h4>
                        <div className="classified-ads-detail-modal-content">{detailModalAd.contactInstructions}</div>
                      </div>
                    )}
                    {detailModalAd.publishDays && detailModalAd.publishDays.length > 0 && (
                      <div className="classified-ads-detail-modal-section">
                        <h4 className="classified-ads-detail-modal-label">Scheduled days</h4>
                        <ul className="classified-ads-detail-modal-publish-days">
                          {detailModalAd.publishDays.map((day, i) => (
                            <li key={i}>{formatPublishDay(day)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="classified-ads-detail-modal-actions">
                      <Link to={`/app/classified-ads/${detailModalAd._id}`} className="classified-ads-detail-modal-apply-btn" onClick={closeDetailModal}>
                        View full ad & apply
                      </Link>
                      <button type="button" onClick={closeDetailModal} className="classified-ads-detail-modal-close-btn">Close</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default ClassifiedAdsListPage;
