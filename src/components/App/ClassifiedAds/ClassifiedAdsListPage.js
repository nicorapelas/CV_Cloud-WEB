import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/api';
import './ClassifiedAdsListPage.css';

const ClassifiedAdsListPage = () => {
  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: '', location: '', jobType: '' });
  const limit = 20;

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit });
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

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="classified-ads-list-page">
      <div className="classified-ads-list-container">
        <h1 className="classified-ads-list-title">Job listings</h1>
        <p className="classified-ads-list-subtitle">Classified ads from employers. Tap an ad to view details and apply.</p>

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
                  <Link to={`/app/classified-ads/${ad._id}`} className="classified-ads-card">
                    <h2 className="classified-ads-card-title">{ad.title}</h2>
                    <p className="classified-ads-card-meta">{ad.companyName}{ad.location ? ` · ${ad.location}` : ''}</p>
                    {(ad.jobType || ad.category) && (
                      <p className="classified-ads-card-tags">
                        {[ad.jobType, ad.category].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {ad.publishedAt && <span className="classified-ads-card-date">Posted {formatDate(ad.publishedAt)}</span>}
                  </Link>
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
      </div>
    </div>
  );
};

export default ClassifiedAdsListPage;
