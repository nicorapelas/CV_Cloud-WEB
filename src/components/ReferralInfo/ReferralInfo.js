import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../../api/api';
import './ReferralInfo.css';

const ReferralInfo = () => {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/api/public/affiliate-instructions', {
        responseType: 'text',
      })
        .then((res) => setMarkdown(res.data))
        .catch((err) => {
          setError(err?.response?.status === 500 ? 'Could not load the page.' : 'Something went wrong.');
        })
        .finally(() => setLoading(false));
  }, []);

  return (
    <div className="referral-info-page">
      <header className="referral-info-header">
        <div className="referral-info-header-inner">
          <Link to="/" className="referral-info-logo-link" aria-label="CV Cloud home">
            <img src="/logo-h79.png" alt="" className="referral-info-logo" />
          </Link>
          <h1 className="referral-info-title">Referral programme</h1>
          <Link to="/signup" className="referral-info-cta">
            Sign up
          </Link>
        </div>
      </header>

      <main className="referral-info-main">
        {loading && (
          <p className="referral-info-loading" aria-live="polite">
            Loading…
          </p>
        )}
        {error && (
          <div className="referral-info-error" role="alert">
            <p>{error}</p>
            <Link to="/">Go to home</Link>
          </div>
        )}
        {!loading && !error && markdown && (
          <article className="referral-info-content">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>
        )}
      </main>

      <footer className="referral-info-footer">
        <Link to="/signup" className="referral-info-footer-link">
          Create your CV with CV Cloud
        </Link>
      </footer>
    </div>
  );
};

export default ReferralInfo;
