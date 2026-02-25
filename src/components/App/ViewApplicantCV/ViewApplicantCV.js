import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import { Context as SaveCVContext } from '../../../context/SaveCVContext';
import { Context as AuthContext } from '../../../context/AuthContext';
import logoImage from '../../../assets/images/icon-512.png';
import Loader from '../../common/loader/Loader';
import PrintOptionsModal from '../SharedCVView/PrintOptionsModal';
import InkFriendlyTemplate from '../SharedCVView/InkFriendlyTemplate';
import FirstImpressionModal from '../SharedCVView/FirstImpressionModal';
import CertificatesModal from '../SharedCVView/CertificatesModal';
import CVTemplateRenderer from '../ViewCV/CVTemplateRenderer';
import './ViewApplicantCV.css';
import '../SharedCVView/SharedCVView.css';
import '../../../styles/print.css';

const ViewApplicantCV = () => {
  const { enquiryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pinFromUrl = searchParams.get('pin') || '';
  const from = searchParams.get('from') || '';
  const backHref = from === 'enquiries' ? '/app/hr-classified-ads/enquiries' : '/';
  const backLabel = from === 'enquiries' ? '← Back to Applications' : '← CV Cloud';

  const [pin, setPin] = useState(pinFromUrl);
  const [cvPayload, setCvPayload] = useState(null);
  const [loading, setLoading] = useState(!!pinFromUrl);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printMode, setPrintMode] = useState('template');
  const [shouldPrint, setShouldPrint] = useState(false);
  const [showFirstImpression, setShowFirstImpression] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { setCVToSave, saveSharedCV } = useContext(SaveCVContext);
  const { state: { user } } = useContext(AuthContext);

  const fetchWithPin = async (pinValue) => {
    if (!enquiryId || !pinValue.trim()) return;
    setError('');
    setValidating(true);
    try {
      const { data } = await api.get(
        `/api/classified-ads/enquiries/${enquiryId}/applicant-cv`,
        { params: { pin: pinValue.trim() } }
      );
      setCvPayload(data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid pin or CV not available';
      setError(msg);
      setCvPayload(null);
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  useEffect(() => {
    if (pinFromUrl && enquiryId && !cvPayload) {
      fetchWithPin(pinFromUrl);
    } else if (!pinFromUrl && enquiryId) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryId, pinFromUrl]);

  useEffect(() => {
    if (shouldPrint) {
      setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, 100);
    }
  }, [shouldPrint, printMode]);

  const cvData = useMemo(() => {
    if (!cvPayload?.curriculumVitae?.[0]) return null;
    const cv = cvPayload.curriculumVitae[0];
    const assignedPhotoUrl =
      cvPayload.shareCVAssignedPhotoUrl ||
      cv._photo?.[0]?.photoUrl ||
      null;
    return {
      personalInfo: cv._personalInfo?.[0] || null,
      contactInfo: cv._contactInfo?.[0] || null,
      personalSummary: cv._personalSummary?.[0] || null,
      experiences: cv._experience || [],
      secondEdu: cv._secondEdu || [],
      skills: cv._skill || [],
      languages: cv._language || [],
      references: cv._reference || [],
      tertEdus: cv._tertEdu || [],
      interests: cv._interest || [],
      attributes: cv._attribute || [],
      employHistorys: cv._employHistory || [],
      assignedPhotoUrl,
      firstImpression: cv._firstImpression?.[0] || null,
      certificates: cv._certificate || [],
    };
  }, [cvPayload]);

  const cvTemplate = cvPayload?.cvTemplate || 'template01';

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter the view pin');
      return;
    }
    setLoading(true);
    fetchWithPin(pin);
  };

  const handlePinChange = (e) => {
    setPin(e.target.value);
    if (error) setError('');
  };

  const handlePrint = () => setShowPrintOptions(true);
  const handlePrintInkFriendly = () => {
    setPrintMode('ink-friendly');
    setShowPrintOptions(false);
    setShouldPrint(true);
  };
  const handlePrintTemplate = () => {
    setPrintMode('template');
    setShowPrintOptions(false);
    setShouldPrint(true);
  };
  const handleClosePrintOptions = () => setShowPrintOptions(false);
  const handleFirstImpression = () => setShowFirstImpression(true);
  const handleCloseFirstImpression = () => setShowFirstImpression(false);
  const handleCertificates = () => setShowCertificates(true);
  const handleCloseCertificates = () => setShowCertificates(false);
  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleMobileMenuClose = () => setIsMobileMenuOpen(false);

  const handleSave = async () => {
    const cv = cvPayload?.curriculumVitae?.[0];
    const personalInfo = cv?._personalInfo?.[0];
    const fullName =
      personalInfo?.fullName ||
      (personalInfo?.firstName && personalInfo?.lastName
        ? `${personalInfo.firstName} ${personalInfo.lastName}`
        : null) ||
      personalInfo?.name;
    if (!cv?._id || !fullName) {
      alert('Unable to save: CV data missing.');
      return;
    }
    if (user) {
      try {
        await saveSharedCV({ curriculumVitaeID: cv._id, fullName });
        navigate('/hr-introduction');
      } catch (err) {
        console.error('Error saving CV:', err);
        alert('Failed to save CV. Please try again.');
      }
    } else {
      setCVToSave({ curriculumVitaeID: cv._id, fullName });
      navigate('/hr-introduction');
    }
  };

  const fullNameForModals =
    cvData?.personalInfo?.fullName ||
    (cvData?.personalInfo?.firstName && cvData?.personalInfo?.lastName
      ? `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`
      : null) ||
    cvData?.personalInfo?.name;

  if (loading || validating) {
    return (
      <div className="shared-cv-view">
        <Loader message={validating ? 'Validating pin...' : 'Loading applicant CV...'} />
      </div>
    );
  }

  if (!cvPayload) {
    return (
      <div className="shared-cv-view">
        <div className="shared-cv-pin-section-wrapper">
          <div className="shared-cv-pin-section">
            <div className="pin-form-container">
              <div className="pin-form-header">
                <div className="pin-form-logo">
                  <img src={logoImage} alt="CV Cloud Logo" className="shared-cv-logo-image" />
                </div>
                <h2>View applicant CV</h2>
                <p>Enter the 6-digit view pin from your application notification (email or app).</p>
              </div>
              <form onSubmit={handlePinSubmit} className="pin-form">
                <div className="form-group">
                  <label htmlFor="view-pin">View pin</label>
                  <input
                    id="view-pin"
                    type="text"
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="6-digit pin"
                    maxLength={6}
                    autoComplete="off"
                    className="form-input pin-input"
                  />
                </div>
                {error && (
                  <div className="form-error">
                    <div className="error-icon">⚠️</div>
                    <span>{error}</span>
                  </div>
                )}
                <small className="form-help-text">Enter the 6-digit pin from your email</small>
                <button type="submit" className="btn btn-primary" disabled={!pin.trim()}>
                  View CV
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`shared-cv-view ${printMode === 'ink-friendly' ? 'ink-friendly-mode' : ''}`}
    >
      <header className="shared-cv-header">
        <div className="shared-cv-container">
          <div className="shared-cv-logo">
            <Link to={backHref} className="view-applicant-cv-back-link">
              {backLabel}
            </Link>
            <img
              src="/logo-h79.png"
              alt="CV Cloud Logo"
              className="shared-cv-logo-image"
            />
            {cvData?.firstImpression?.videoUrl && (
              <div className="shared-cv-video-badge">🎥</div>
            )}
          </div>

          <nav className="shared-cv-nav">
            {cvData?.firstImpression?.videoUrl && (
              <>
                <div>Video included →</div>
                <button
                  type="button"
                  onClick={handleFirstImpression}
                  className="shared-cv-nav-link first-impression-button"
                  title="View First Impression Video"
                >
                  🎥 First Impression
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="shared-cv-nav-link"
              title="Print CV"
            >
              🖨️ Print
            </button>
            <div className="save-button-container">
              <button
                type="button"
                onClick={handleSave}
                className="shared-cv-nav-link save-button"
                title="Save CV"
              >
                💾 Save CV
              </button>
              <div className="hr-bubble">
                <span className="hr-text">HR</span>
              </div>
            </div>
          </nav>

          <div className="shared-cv-mobile-menu-container">
            {cvData?.firstImpression?.videoUrl && (
              <div className="shared-cv-mobile-video-text">Video →</div>
            )}
            <button
              type="button"
              onClick={handleMobileMenuToggle}
              className="shared-cv-mobile-menu-button"
              title="Menu"
            >
              <div className="shared-cv-hamburger">
                <span />
                <span />
                <span />
              </div>
              {cvData?.firstImpression?.videoUrl && (
                <div className="shared-cv-burger-video-indicator">🎥</div>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="shared-cv-mobile-menu">
            {cvData?.firstImpression?.videoUrl && (
              <button
                type="button"
                onClick={() => {
                  handleFirstImpression();
                  handleMobileMenuClose();
                }}
                className="shared-cv-mobile-menu-item first-impression-button"
                title="View First Impression Video"
              >
                🎥 First Impression
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                handlePrint();
                handleMobileMenuClose();
              }}
              className="shared-cv-mobile-menu-item"
              title="Print CV"
            >
              🖨️ Print
            </button>
            <button
              type="button"
              onClick={() => {
                handleSave();
                handleMobileMenuClose();
              }}
              className="shared-cv-mobile-menu-item save-button"
              title="Save CV"
            >
              💾 Save CV
            </button>
          </div>
        )}
      </header>

      <div className="shared-cv-content">
        <div className="cv-preview-container">
          {printMode === 'ink-friendly' ? (
            <InkFriendlyTemplate cvData={cvData} />
          ) : (
            <CVTemplateRenderer
              cvData={cvData}
              templateSelected={cvTemplate}
              fallbackTemplate="template01"
            />
          )}

          {cvData?.certificates?.length > 0 &&
            !showFirstImpression &&
            !isMobileMenuOpen && (
              <button
                type="button"
                onClick={handleCertificates}
                className="floating-certificates-button"
                title={`View ${cvData.certificates.length} Certificate${cvData.certificates.length > 1 ? 's' : ''}`}
              >
                <span className="certificates-icon">📋</span>
                <span className="certificates-count">{cvData.certificates.length}</span>
              </button>
            )}
        </div>
      </div>

      <PrintOptionsModal
        isOpen={showPrintOptions}
        onClose={handleClosePrintOptions}
        onPrintInkFriendly={handlePrintInkFriendly}
        onPrintTemplate={handlePrintTemplate}
      />
      <FirstImpressionModal
        isOpen={showFirstImpression}
        onClose={handleCloseFirstImpression}
        videoUrl={cvData?.firstImpression?.videoUrl}
        fullName={fullNameForModals}
      />
      <CertificatesModal
        isOpen={showCertificates}
        onClose={handleCloseCertificates}
        certificates={cvData?.certificates}
        fullName={fullNameForModals}
      />
    </div>
  );
};

export default ViewApplicantCV;
