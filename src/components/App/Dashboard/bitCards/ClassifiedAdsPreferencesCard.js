import React, { useState, useEffect } from 'react';
import api from '../../../../api/api';
import './ClassifiedAdsPreferencesCard.css';

const ClassifiedAdsPreferencesCard = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    classifiedAdsOptIn: false,
    classifiedAdsEmailNotifications: false,
    classifiedAdsInAppNotifications: false,
  });

  const fetchPrefs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/user-preferences/classified-ads');
      setPrefs({
        classifiedAdsOptIn: Boolean(data.classifiedAdsOptIn),
        classifiedAdsEmailNotifications: Boolean(data.classifiedAdsEmailNotifications),
        classifiedAdsInAppNotifications: Boolean(data.classifiedAdsInAppNotifications),
      });
    } catch (err) {
      console.error('Failed to load job listing preferences', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const updatePref = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    try {
      await api.put('/api/user-preferences/classified-ads', next);
    } catch (err) {
      setPrefs(prefs);
      console.error('Failed to update preference', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="classified-ads-prefs-card">
        <div className="classified-ads-prefs-loading">Loading preferences…</div>
      </div>
    );
  }

  return (
    <div className="classified-ads-prefs-card">
      <div className="classified-ads-prefs-header">
        <div className="classified-ads-prefs-icon">📋</div>
        <div>
          <h4>Job listings</h4>
          <p className="classified-ads-prefs-subtitle">
            See job listings from employers and choose how you want to be notified about new posts.
          </p>
        </div>
      </div>
      <div className="classified-ads-prefs-body">
        <label className="classified-ads-prefs-row">
          <span className="classified-ads-prefs-label">Show job listings</span>
          <button
            type="button"
            className={`classified-ads-prefs-toggle ${prefs.classifiedAdsOptIn ? 'on' : ''}`}
            onClick={() => updatePref('classifiedAdsOptIn', !prefs.classifiedAdsOptIn)}
            disabled={saving}
          >
            {prefs.classifiedAdsOptIn ? 'On' : 'Off'}
          </button>
        </label>
        {prefs.classifiedAdsOptIn && (
          <>
            <label className="classified-ads-prefs-row">
              <span className="classified-ads-prefs-label">Email when new jobs are posted</span>
              <button
                type="button"
                className={`classified-ads-prefs-toggle ${prefs.classifiedAdsEmailNotifications ? 'on' : ''}`}
                onClick={() => updatePref('classifiedAdsEmailNotifications', !prefs.classifiedAdsEmailNotifications)}
                disabled={saving}
              >
                {prefs.classifiedAdsEmailNotifications ? 'On' : 'Off'}
              </button>
            </label>
            <label className="classified-ads-prefs-row">
              <span className="classified-ads-prefs-label">In-app notification when new jobs are posted</span>
              <button
                type="button"
                className={`classified-ads-prefs-toggle ${prefs.classifiedAdsInAppNotifications ? 'on' : ''}`}
                onClick={() => updatePref('classifiedAdsInAppNotifications', !prefs.classifiedAdsInAppNotifications)}
                disabled={saving}
              >
                {prefs.classifiedAdsInAppNotifications ? 'On' : 'Off'}
              </button>
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default ClassifiedAdsPreferencesCard;
