import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Context as ClassifiedAdsContext } from '../../../context/ClassifiedAdsContext';
import { Context as PersonalInfoContext } from '../../../context/PersonalInfoContext';
import { dashboardJobQuotes } from './cvQuotes';
import './Dashboard.css';

/**
 * Reusable blue bar row: typewriter quote + Job listings & Referrals buttons.
 * Renders nothing when classified ads are inactive.
 *
 * @param {Object} props
 * @param {function} [props.onOpenReferrals] - Called when Referrals is clicked (e.g. to open modal)
 */
const DashboardHeaderSecondaryRow = ({ onOpenReferrals }) => {
  const { state: { classifiedAdsActive } } = useContext(ClassifiedAdsContext);
  const { state: { personalInfo } } = useContext(PersonalInfoContext);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteDisplay, setQuoteDisplay] = useState('');
  const [quoteTyping, setQuoteTyping] = useState(true);
  const [quoteCursor, setQuoteCursor] = useState(true);

  useEffect(() => {
    if (!classifiedAdsActive || dashboardJobQuotes.length === 0) return;
    const fullText = dashboardJobQuotes[quoteIndex];
    let timeout;
    if (quoteTyping) {
      if (quoteDisplay.length < fullText.length) {
        timeout = setTimeout(
          () => setQuoteDisplay(fullText.slice(0, quoteDisplay.length + 1)),
          50 + Math.random() * 50
        );
      } else {
        timeout = setTimeout(() => setQuoteTyping(false), 3000);
      }
    } else {
      if (quoteDisplay.length > 0) {
        timeout = setTimeout(
          () => setQuoteDisplay(quoteDisplay.slice(0, -1)),
          30 + Math.random() * 30
        );
      } else {
        setQuoteIndex(prev => (prev + 1) % dashboardJobQuotes.length);
        setQuoteTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [classifiedAdsActive, quoteDisplay, quoteTyping, quoteIndex]);

  useEffect(() => {
    if (!classifiedAdsActive) return;
    const cursorInterval = setInterval(() => setQuoteCursor(prev => !prev), 500);
    return () => clearInterval(cursorInterval);
  }, [classifiedAdsActive]);

  if (!classifiedAdsActive) return null;

  const hasFullName = personalInfo && personalInfo.length > 0 && personalInfo[0].fullName;

  return (
    <div className="dashboard-header-secondary-row">
      <div className="dashboard-header-secondary-row-inner">
        <div className="dashboard-header-secondary-quote-wrap">
          <span className="dashboard-header-secondary-quote-text">
            {quoteDisplay}
            <span className={`dashboard-header-secondary-quote-cursor ${quoteCursor ? 'visible' : ''}`} aria-hidden="true">|</span>
          </span>
          {quoteDisplay.length === dashboardJobQuotes[quoteIndex]?.length && (
            <span className="dashboard-header-secondary-quote-arrow" aria-hidden="true">→</span>
          )}
        </div>
        <div className="dashboard-header-secondary-buttons">
          {hasFullName ? (
            <Link to="/app/classified-ads" className="dashboard-header-secondary-btn">Job listings</Link>
          ) : (
            <span className="dashboard-header-secondary-btn disabled" title="Please add your full name first">Job listings</span>
          )}
          <button
            type="button"
            className="dashboard-header-secondary-btn dashboard-header-secondary-btn-referrals"
            onClick={() => onOpenReferrals?.()}
          >
            Referrals
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeaderSecondaryRow;
