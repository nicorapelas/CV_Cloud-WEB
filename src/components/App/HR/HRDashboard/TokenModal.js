import React, { useState, useEffect } from 'react';
import api from '../../../../api/api';
import './TokenModal.css';

const TokenModal = ({ onClose }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchBalance = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/api/classified-ads/tokens/balance');
        if (!cancelled) {
          setBalance(data.balance);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load token balance');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBalance();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="token-modal-overlay" onClick={onClose}>
      <div className="token-modal" onClick={e => e.stopPropagation()}>
        <div className="token-modal-header">
          <h2>Classified Ads Tokens</h2>
          <button
            type="button"
            className="token-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="token-modal-body">
          {loading ? (
            <p className="token-modal-loading">Loading balance…</p>
          ) : error ? (
            <p className="token-modal-error">{error}</p>
          ) : (
            <>
              <div className="token-modal-balance">
                <span className="token-modal-balance-label">Current balance</span>
                <span className="token-modal-balance-value">{balance}</span>
                <span className="token-modal-balance-unit">tokens</span>
              </div>
              <p className="token-modal-hint">
                Tokens are used to publish classified ads. One token = one day of visibility. Contact support to get more tokens.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenModal;
