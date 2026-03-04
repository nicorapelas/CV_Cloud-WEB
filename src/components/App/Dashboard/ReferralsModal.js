import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import { Context as AuthContext } from '../../../context/AuthContext';
import './ReferralsModal.css';

const ReferralsModal = ({ onClose }) => {
  const [localLoading, setLocalLoading] = useState(true);
  const {
    state: { affiliateInfo, affiliates },
    addAffiliateInfo,
    addAffiliates,
    clearAffiliateInfo,
    clearAffiliates,
  } = useContext(AuthContext);

  useEffect(() => {
    setLocalLoading(true);
    Promise.all([addAffiliateInfo(), addAffiliates()]).finally(() => {
      setLocalLoading(false);
    });
    return () => {
      clearAffiliateInfo();
      clearAffiliates();
    };
  }, [addAffiliateInfo, addAffiliates, clearAffiliateInfo, clearAffiliates]);

  const hasError = affiliateInfo && typeof affiliateInfo === 'object' && 'error' in affiliateInfo;
  const info = hasError ? null : (Array.isArray(affiliateInfo) ? affiliateInfo[0] : affiliateInfo);
  const introList = Array.isArray(affiliates) ? affiliates : [];

  return (
    <div className="referrals-modal-overlay" onClick={onClose}>
      <div className="referrals-modal" onClick={e => e.stopPropagation()}>
        <div className="referrals-modal-header">
          <h2>Referrals</h2>
          <button type="button" className="referrals-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="referrals-modal-body">
          {localLoading && !info && introList.length === 0 ? (
            <p className="referrals-loading">Loading…</p>
          ) : info ? (
            <>
              <div className="referrals-my-code">
                <strong>Your referral code</strong>
                <code className="referrals-code">{info.code}</code>
                <p className="referrals-intros-count">Introductions: {info.introductions ?? 0}</p>
                <p className="referrals-intros-count">First Impressions: {info.firstImpressions ?? 0}</p>
              </div>
              {introList.length > 0 && (
                <div className="referrals-intros">
                  <strong>Users who used your code</strong>
                  <ul className="referrals-intros-list">
                    {introList.map(u => (
                      <li key={u._id}>{u.email || u.username}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="referrals-none">You don’t have an affiliate account yet. Contact support if you expect a referral code.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralsModal;
