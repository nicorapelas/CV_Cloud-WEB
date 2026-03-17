import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context as ShareCVContext } from '../../../context/ShareCVContext';
import { Context as SaveCVContext } from '../../../context/SaveCVContext';
import { Context as AuthContext } from '../../../context/AuthContext';
import logoImage from '../../../assets/images/icon-512.png';
import Loader from '../../common/loader/Loader';
import PrintOptionsModal from './PrintOptionsModal';
import InkFriendlyTemplate from './InkFriendlyTemplate';
import FirstImpressionModal from './FirstImpressionModal';
import CertificatesModal from './CertificatesModal';
import CVTemplateRenderer from '../ViewCV/CVTemplateRenderer';
import Template01 from '../ViewCV/templates/template01/Template01';
import Template02 from '../ViewCV/templates/template02/Template02';
import Template03 from '../ViewCV/templates/template03/Template03';
import Template04 from '../ViewCV/templates/template04/Template04';
import Template05 from '../ViewCV/templates/template05/Template05';
import Template06 from '../ViewCV/templates/template06/Template06';
import Template07 from '../ViewCV/templates/template07/Template07';
import Template08 from '../ViewCV/templates/template08/Template08';
import Template09 from '../ViewCV/templates/template09/Template09';
import Template10 from '../ViewCV/templates/template10/Template10';
import './SharedCVView.css';
import '../../../styles/print.css';

const SharedCVView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isValidPin, setIsValidPin] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printMode, setPrintMode] = useState('template'); // 'template' or 'ink-friendly'
  const [shouldPrint, setShouldPrint] = useState(false);
  const [showFirstImpression, setShowFirstImpression] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSavingSharedCV, setIsSavingSharedCV] = useState(false);

  const {
    state: { shareCV, shareCV_ToView, loading, cvTemplateSelected },
    fetchShareCVByCurriculumVitaeId,
    fetchShareCV_ToView,
    setCVTemplateSelected,
    trackCVView,
  } = useContext(ShareCVContext);

  const { setCVToSave, saveSharedCV } = useContext(SaveCVContext);

  const {
    state: { user },
  } = useContext(AuthContext);

  // Track if initial fetch is done to prevent flicker
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Ref to track if CV data has been fetched to prevent duplicate fetches
  const cvDataFetchedRef = useRef(false);

  // Ref to track which ID we've fetched to prevent re-fetching same ID
  const fetchedIdRef = useRef(null);

  // Ref to track if template has been set
  const templateSetRef = useRef(false);

  useEffect(() => {
    if (id && fetchedIdRef.current !== id) {
      fetchShareCVByCurriculumVitaeId(id);
      fetchedIdRef.current = id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Mark initial fetch as done when shareCV is loaded (or fails to load)
  useEffect(() => {
    if (!loading && id && !initialFetchDone) {
      setInitialFetchDone(true);
    }
  }, [loading, id, initialFetchDone]);

  // Fetch CV data when pin is validated (only once)
  useEffect(() => {
    if (isValidPin && shareCV?.curriculumVitaeID && !cvDataFetchedRef.current) {
      fetchShareCV_ToView(shareCV.curriculumVitaeID);
      cvDataFetchedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidPin, shareCV?.curriculumVitaeID]);

  useEffect(() => {
    if (shareCV?.CVTemplate && !templateSetRef.current) {
      setCVTemplateSelected(shareCV.CVTemplate);
      templateSetRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareCV?.CVTemplate]);

  // Ref to track if view has been tracked
  const viewTrackedRef = useRef(false);

  // Ref to prevent duplicate save requests (double-click / multiple buttons)
  const saveInFlightRef = useRef(new Set());

  // Track CV view when pin is validated and CV data is loaded (only once)
  useEffect(() => {
    if (
      isValidPin &&
      shareCV?.curriculumVitaeID &&
      shareCV_ToView &&
      !viewTrackedRef.current
    ) {
      const firstRecipient = shareCV.recipients && shareCV.recipients[0];
      const recipientEmail = firstRecipient?.email || 'anonymous@viewer.com';
      const recipientName = firstRecipient?.name || 'Anonymous Viewer';

      trackCVView(shareCV.curriculumVitaeID, recipientEmail, recipientName);
      viewTrackedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidPin, shareCV?.curriculumVitaeID, shareCV_ToView]);

  // Handle print when shouldPrint changes
  useEffect(() => {
    if (shouldPrint) {
      setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, 100);
    }
  }, [shouldPrint, printMode]);

  // Prepare CV data object from shareCV_ToView - Memoized to prevent re-renders
  const cvData = useMemo(() => {
    if (!shareCV_ToView?.curriculumVitae?.[0]) return null;

    const cv = shareCV_ToView.curriculumVitae[0];
    // Use ShareCV's assignedPhotoUrl if available (from when CV was shared), otherwise fall back to CV's photo
    const assignedPhotoUrl =
      shareCV?.assignedPhotoUrl ||
      shareCV_ToView?.shareCVAssignedPhotoUrl ||
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
      assignedPhotoUrl: assignedPhotoUrl,
      firstImpression: cv._firstImpression?.[0] || null,
      certificates: cv._certificate || [],
    };
  }, [shareCV_ToView, shareCV]);

  // Render template based on selection
  const renderTemplate = () => {
    if (!cvData) return null;

    // Debug: log template selection once per value (to avoid spam)
    // Mirrors the HRViewCV log format for easy comparison.
    if (!renderTemplate._lastLoggedTemplate || renderTemplate._lastLoggedTemplate !== cvTemplateSelected) {
      renderTemplate._lastLoggedTemplate = cvTemplateSelected;
      console.log('🎨 SharedCVView - renderTemplate called:', {
        hasCvData: !!cvData,
        cvTemplateSelected,
        cvTemplateSelectedType: typeof cvTemplateSelected,
        shareCVCVTemplate: shareCV?.CVTemplate ?? null,
        isValidPin,
        timestamp: new Date().toISOString(),
      });
    }

    // Use the same reusable renderer as HRViewCV
    // Default/fallback is template01 ("Modern") which is also the preferred mobile fallback.
    return (
      <CVTemplateRenderer
        cvData={cvData}
        templateSelected={cvTemplateSelected || 'template01'}
        fallbackTemplate="template01"
      />
    );
  };

  const handlePinChange = e => {
    setPin(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handlePinSubmit = e => {
    e.preventDefault();

    if (!pin.trim()) {
      setError('Please enter a view pin');
      return;
    }

    if (!shareCV) {
      setError('CV information not loaded yet');
      return;
    }

    setError('');
    setIsValidating(true);

    // Simulate validation delay
    setTimeout(() => {
      if (shareCV.viewPin && shareCV.viewPin.toString() === pin.trim()) {
        setIsValidPin(true);
        setError('');
      } else {
        setError('Invalid view pin. Please check and try again.');
        setIsValidPin(false);
      }
      setIsValidating(false);
    }, 500);
  };

  // Show loader until initial fetch is complete
  if (loading || !initialFetchDone) {
    return <Loader message="Loading shared CV..." />;
  }

  // Only show "not found" after we've tried to fetch and shareCV is still null
  if (!shareCV) {
    return (
      <div className="shared-cv-view">
        <div className="shared-cv-error">
          <div className="error-icon">❌</div>
          <h2>CV Not Found</h2>
          <p>The shared CV could not be found or may have been removed.</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    setShowPrintOptions(true);
  };

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

  const handleClosePrintOptions = () => {
    setShowPrintOptions(false);
  };

  const handleFirstImpression = () => {
    setShowFirstImpression(true);
  };

  const handleCloseFirstImpression = () => {
    setShowFirstImpression(false);
  };

  const handleCertificates = () => {
    setShowCertificates(true);
  };

  const handleCloseCertificates = () => {
    setShowCertificates(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSave = async () => {
    const cv = shareCV_ToView?.curriculumVitae?.[0];
    const curriculumVitaeID = cv?._id;
    const fullName = cv?._personalInfo?.[0]?.fullName;

    if (!curriculumVitaeID || !fullName) {
      alert('Unable to save: CV data missing.');
      return;
    }

    if (saveInFlightRef.current.has(curriculumVitaeID)) return;
    saveInFlightRef.current.add(curriculumVitaeID);

    setIsSavingSharedCV(true);
    try {
      if (user) {
        await saveSharedCV({ curriculumVitaeID, fullName });
        navigate('/hr-introduction');
        return;
      }

      setCVToSave({ curriculumVitaeID, fullName });
      navigate('/hr-introduction');
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('Failed to save CV. Please try again.');
    } finally {
      saveInFlightRef.current.delete(curriculumVitaeID);
      setIsSavingSharedCV(false);
    }
  };

  return (
    <div
      className={`shared-cv-view ${printMode === 'ink-friendly' ? 'ink-friendly-mode' : ''}`}
    >
      {/* Header */}
      <header className="shared-cv-header">
        <div className="shared-cv-container">
          <div className="shared-cv-logo">
            <img
              src="/logo-h79.png"
              alt="CV Cloud Logo"
              className="shared-cv-logo-image"
            />
            {isValidPin && cvData?.firstImpression?.videoUrl && (
              <div className="shared-cv-video-badge">🎥</div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="shared-cv-nav">
            {isValidPin && cvData?.firstImpression?.videoUrl && (
              <>
                <div>Video included →</div>
                <button
                  onClick={handleFirstImpression}
                  className="shared-cv-nav-link first-impression-button"
                  title="View First Impression Video"
                >
                  🎥 First Impression
                </button>
              </>
            )}
            {isValidPin && (
              <button
                onClick={handlePrint}
                className="shared-cv-nav-link"
                title="Print CV"
              >
                🖨️ Print
              </button>
            )}
            {isValidPin && (
              <div className="save-button-container">
                <button
                  onClick={handleSave}
                  className="shared-cv-nav-link save-button"
                  title="Save CV"
                  disabled={isSavingSharedCV}
                >
                  {isSavingSharedCV ? '⏳ Saving...' : '💾 Save CV'}
                </button>
                <div className="hr-bubble">
                  <span className="hr-text">HR</span>
                </div>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          {isValidPin && (
            <div className="shared-cv-mobile-menu-container">
              {cvData?.firstImpression?.videoUrl && (
                <div className="shared-cv-mobile-video-text">Video →</div>
              )}
              <button
                onClick={handleMobileMenuToggle}
                className="shared-cv-mobile-menu-button"
                title="Menu"
              >
                <div className="shared-cv-hamburger">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                {cvData?.firstImpression?.videoUrl && (
                  <div className="shared-cv-burger-video-indicator">🎥</div>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isValidPin && isMobileMenuOpen && (
          <div className="shared-cv-mobile-menu">
            {cvData?.firstImpression?.videoUrl && (
              <button
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
              onClick={() => {
                handleSave();
                handleMobileMenuClose();
              }}
              className="shared-cv-mobile-menu-item save-button"
              title="Save CV"
              disabled={isSavingSharedCV}
            >
              {isSavingSharedCV ? '⏳ Saving...' : '💾 Save CV'}
            </button>
          </div>
        )}
      </header>

      {!isValidPin ? (
        <div className="shared-cv-pin-section-wrapper">
          <div className="shared-cv-pin-section">
            <div className="pin-form-container">
              <div className="pin-form-header">
                <div className="pin-form-logo">
                  <img
                    src={logoImage}
                    alt="CV Cloud Logo"
                    className="shared-cv-logo-image"
                  />
                </div>
                <h2>Enter View Pin</h2>
                <p>
                  Please enter the 6-digit view pin that was provided in the
                  email
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="pin-form">
                <div className="form-group">
                  <label htmlFor="view-pin">View Pin:</label>
                  <input
                    type="text"
                    id="view-pin"
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="Enter 6-digit pin"
                    className="form-input pin-input"
                    maxLength={6}
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="form-error">
                    <div className="error-icon">⚠️</div>
                    <span>{error}</span>
                  </div>
                )}

                <small className="form-help-text">
                  Enter the 6-digit pin from your email
                </small>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isValidating || !pin.trim()}
                >
                  {isValidating ? 'Validating...' : 'View CV'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="shared-cv-content">
          {shareCV_ToView ? (
            <div className="cv-preview-container">
              {printMode === 'ink-friendly' ? (
                <InkFriendlyTemplate cvData={cvData} />
              ) : (
                renderTemplate()
              )}

              {/* Floating Certificates Button */}
              {isValidPin &&
                cvData?.certificates?.length > 0 &&
                !showFirstImpression &&
                !isMobileMenuOpen && (
                  <button
                    onClick={handleCertificates}
                    className="floating-certificates-button"
                    title={`View ${cvData.certificates.length} Certificate${cvData.certificates.length > 1 ? 's' : ''}`}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 9999,
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    <span className="certificates-icon">📋</span>
                    <span className="certificates-count">
                      {cvData.certificates.length}
                    </span>
                  </button>
                )}
            </div>
          ) : (
            <div className="shared-cv-loading">
              <Loader show={true} message="Loading CV data..." />
            </div>
          )}
        </div>
      )}

      {/* Print Options Modal */}
      <PrintOptionsModal
        isOpen={showPrintOptions}
        onClose={handleClosePrintOptions}
        onPrintInkFriendly={handlePrintInkFriendly}
        onPrintTemplate={handlePrintTemplate}
      />

      {/* First Impression Modal */}
      <FirstImpressionModal
        isOpen={showFirstImpression}
        onClose={handleCloseFirstImpression}
        videoUrl={cvData?.firstImpression?.videoUrl}
        fullName={
          cvData?.personalInfo?.fullName ||
          (cvData?.personalInfo?.firstName && cvData?.personalInfo?.lastName
            ? `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`
            : null) ||
          cvData?.personalInfo?.name
        }
      />

      {/* Certificates Modal */}
      <CertificatesModal
        isOpen={showCertificates}
        onClose={handleCloseCertificates}
        certificates={cvData?.certificates}
        fullName={
          cvData?.personalInfo?.fullName ||
          (cvData?.personalInfo?.firstName && cvData?.personalInfo?.lastName
            ? `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`
            : null) ||
          cvData?.personalInfo?.name
        }
      />
    </div>
  );
};

export default SharedCVView;
