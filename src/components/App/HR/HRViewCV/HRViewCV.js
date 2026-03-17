import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Context as SaveCVContext } from '../../../../context/SaveCVContext';
import { Context as PublicCVContext } from '../../../../context/PublicCVContext';
import Loader from '../../../common/loader/Loader';
import PrintOptionsModal from '../../SharedCVView/PrintOptionsModal';
import InkFriendlyTemplate from '../../SharedCVView/InkFriendlyTemplate';
import FirstImpressionModal from '../../SharedCVView/FirstImpressionModal';
import CertificatesModal from '../../SharedCVView/CertificatesModal';
import CVTemplateRenderer from '../../ViewCV/CVTemplateRenderer';
import './HRViewCV.css';
import '../../../../styles/print.css';

const HRViewCV = () => {
  const { id } = useParams(); // curriculumVitaeID
  const navigate = useNavigate();
  const location = useLocation(); // Use React Router's location for proper reactivity

  // Parse URL params - use useMemo to ensure it's stable and reactive
  const urlParams = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      isPreview: params.get('preview') === 'true',
      fromRoute: params.get('from') || 'dashboard',
      shouldOpenNotes: params.get('notes') === 'true',
    };
  }, [location.search]); // Re-compute when search changes

  const isPreview = urlParams.isPreview;
  const fromRoute = urlParams.fromRoute;
  const shouldOpenNotes = urlParams.shouldOpenNotes;

  // Dynamic values based on source
  const backRoute =
    fromRoute === 'browse' ? '/app/hr-browse-cvs' : fromRoute === 'enquiries' ? '/app/hr-classified-ads/enquiries' : '/app/hr-dashboard';
  const backText =
    fromRoute === 'browse' ? '← Back to Browse CVs' : fromRoute === 'enquiries' ? '← Back to Applications' : '← Back to HR Dashboard';
  const headerTitle = isPreview ? 'Preview CV' : 'Saved CV';
  const headerSubtitle = isPreview
    ? 'Preview candidate profile before saving'
    : 'Review candidate profile and add notes';

  // Local state
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printMode, setPrintMode] = useState('template');
  const [shouldPrint, setShouldPrint] = useState(false);
  const [showFirstImpression, setShowFirstImpression] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedRank, setSelectedRank] = useState('null');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isUpdatingRank, setIsUpdatingRank] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isSavingCV, setIsSavingCV] = useState(false);
  const [cvSaved, setCvSaved] = useState(false);
  const [viewError, setViewError] = useState(null);

  const {
    state: {
      loading,
      savedCV_ToView,
      cvTemplateSelected,
      savedCVInfo,
      assignedPhotoUrl,
      shareCVAssignedPhotoUrl,
      isPreviewMode,
    },
    fetchSavedCVToView,
    fetchPublicCVPreview,
    addNoteToSavedCV,
    updateSavedCVRank,
    deleteNoteFromSavedCV,
    fetchSavedCVs,
  } = useContext(SaveCVContext);

  const { savePublicCV } = useContext(PublicCVContext);

  // Track if we've already fetched to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const lastFetchParamsRef = useRef({ id: null, isPreview: null });

  // Prevent duplicate save requests (same-tick double click)
  const saveInFlightRef = useRef(false);

  // Fetch CV data when component mounts
  useEffect(() => {
    if (!id) return;

    // Check if we've already fetched with these exact parameters
    const currentParams = { id, isPreview };
    const lastParams = lastFetchParamsRef.current;

    if (
      hasFetchedRef.current &&
      lastParams.id === currentParams.id &&
      lastParams.isPreview === currentParams.isPreview
    ) {
      console.log('⏭️ HRViewCV: Skipping duplicate fetch:', currentParams);
      return;
    }

    console.log('🔄 HRViewCV useEffect triggered:', {
      id,
      isPreview,
      url: location.pathname + location.search,
      search: location.search,
    });

    // Mark as fetched and store params
    hasFetchedRef.current = true;
    lastFetchParamsRef.current = currentParams;

    if (isPreview) {
      console.log('🔍 HRViewCV: Fetching public CV preview for:', id);
      fetchPublicCVPreview(id).catch(error => {
        console.error('❌ HRViewCV: Error fetching preview:', error);
        hasFetchedRef.current = false; // Reset on error so it can retry
      });
    } else {
      console.log('📋 HRViewCV: Fetching saved CV for:', id);
      setViewError(null);
      fetchSavedCVToView(id).catch(error => {
        console.error('❌ HRViewCV: Error fetching saved CV:', error);
        setViewError(error);
        hasFetchedRef.current = false; // Reset on error so it can retry
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isPreview]); // Only depend on id and isPreview, not the functions

  // Reset fetch flag and view error when id or isPreview changes
  useEffect(() => {
    hasFetchedRef.current = false;
    lastFetchParamsRef.current = { id: null, isPreview: null };
    setViewError(null);
  }, [id, isPreview]);

  // Set initial rank when savedCVInfo loads
  useEffect(() => {
    if (savedCVInfo && savedCVInfo.rank) {
      setSelectedRank(savedCVInfo.rank);
    }
  }, [savedCVInfo]);

  // Auto-open notes panel if notes=true in URL
  useEffect(() => {
    if (shouldOpenNotes && !isPreview) {
      setShowNotesPanel(true);
    }
  }, [shouldOpenNotes, isPreview]);

  // Handle print
  useEffect(() => {
    if (shouldPrint) {
      setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, 100);
    }
  }, [shouldPrint]);

  // Prepare CV data object
  const cvData =
    savedCV_ToView && savedCV_ToView[0]
      ? {
          personalInfo: savedCV_ToView[0]._personalInfo?.[0] || null,
          contactInfo: savedCV_ToView[0]._contactInfo?.[0] || null,
          personalSummary: savedCV_ToView[0]._personalSummary?.[0] || null,
          experiences: savedCV_ToView[0]._experience || [],
          secondEdu: savedCV_ToView[0]._secondEdu || [],
          skills: savedCV_ToView[0]._skill || [],
          languages: savedCV_ToView[0]._language || [],
          references: savedCV_ToView[0]._reference || [],
          tertEdus: savedCV_ToView[0]._tertEdu || [],
          interests: savedCV_ToView[0]._interest || [],
          attributes: savedCV_ToView[0]._attribute || [],
          employHistorys: savedCV_ToView[0]._employHistory || [],
          // Priority: 1) Current assigned photo from server, 2) ShareCV photo, 3) CV's photo
          assignedPhotoUrl:
            assignedPhotoUrl ||
            shareCVAssignedPhotoUrl ||
            savedCV_ToView[0]._photo?.[0]?.photoUrl ||
            null,
          firstImpression: savedCV_ToView[0]._firstImpression?.[0] || null,
          certificates: savedCV_ToView[0]._certificate || [],
        }
      : null;

  // Render template using reusable component
  const renderTemplate = () => {
    if (!cvData) return null;

    console.log('🎨 HRViewCV - renderTemplate called:', {
      hasCvData: !!cvData,
      cvTemplateSelected,
      cvTemplateSelectedType: typeof cvTemplateSelected,
      isPreviewMode,
      timestamp: new Date().toISOString(),
    });

    return (
      <CVTemplateRenderer
        cvData={cvData}
        templateSelected={cvTemplateSelected}
      />
    );
  };

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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSavingNote(true);
    try {
      await addNoteToSavedCV(id, newNote.trim());
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async noteId => {
    try {
      await deleteNoteFromSavedCV(id, noteId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleSaveCV = async () => {
    if (!id || cvSaved || saveInFlightRef.current) return;
    saveInFlightRef.current = true;

    setIsSavingCV(true);
    try {
      await savePublicCV(id);
      setCvSaved(true);
      fetchSavedCVs();
      console.log('✅ CV saved successfully from preview');
    } catch (error) {
      console.error('❌ Error saving CV:', error);
      alert('Failed to save CV. Please try again.');
    } finally {
      setIsSavingCV(false);
      saveInFlightRef.current = false;
    }
  };

  const handleRankChange = async e => {
    const newRank = e.target.value;
    setSelectedRank(newRank);
    setIsUpdatingRank(true);

    try {
      await updateSavedCVRank(id, newRank);
    } catch (error) {
      console.error('Error updating rank:', error);
      alert('Failed to update rank. Please try again.');
      if (savedCVInfo) {
        setSelectedRank(savedCVInfo.rank);
      }
    } finally {
      setIsUpdatingRank(false);
    }
  };

  const getRankColor = rank => {
    switch (rank) {
      case 'excellent':
        return '#2ecc71';
      case 'good':
        return '#3498db';
      case 'fair':
        return '#f39c12';
      case 'poor':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Loader />;

  const isAccessDenied =
    viewError && viewError.response && viewError.response.status === 403;
  if (isAccessDenied) {
    return (
      <div className="hr-view-cv">
        <div className="hr-view-cv-error">
          <div className="error-icon">🔒</div>
          <h2>Access not approved</h2>
          <p>
            {viewError.response?.data?.error ||
              'The candidate must approve your request to view their full CV.'}
          </p>
          <button
            onClick={() => navigate(backRoute)}
            className="btn-back"
          >
            {backText}
          </button>
        </div>
      </div>
    );
  }

  if (!savedCV_ToView || !savedCVInfo) {
    return (
      <div className="hr-view-cv">
        <div className="hr-view-cv-error">
          <div className="error-icon">❌</div>
          <h2>CV Not Found</h2>
          <p>The saved CV could not be found or may have been removed.</p>
          <button
            onClick={() => navigate('/app/hr-dashboard')}
            className="btn-back"
          >
            ← Back to HR Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`hr-view-cv ${printMode === 'ink-friendly' ? 'ink-friendly-mode' : ''}`}
    >
      {/* Header - Matches ViewCV structure exactly */}
      <div className="hr-view-cv-header">
        <div className="hr-view-cv-header-left">
          <button
            onClick={() => navigate(backRoute)}
            className="hr-view-cv-back"
          >
            {backText}
          </button>
        </div>
        <div className="hr-view-cv-header-center">
          <div className="hr-view-cv-header-icon">
            {isPreview ? '🔍' : '📋'}
          </div>
          <div className="hr-view-cv-header-content">
            <h1>{headerTitle}</h1>
            <p>{headerSubtitle}</p>
          </div>
        </div>
        <div className="hr-view-cv-header-actions">
          {isPreview && (
            <button
              onClick={handleSaveCV}
              disabled={isSavingCV || cvSaved}
              className={`hr-view-cv-save-button ${cvSaved ? 'saved' : ''}`}
              title={
                cvSaved
                  ? 'CV Saved Successfully'
                  : 'Save this CV to your collection'
              }
            >
              {isSavingCV ? (
                <>⏳ Saving...</>
              ) : cvSaved ? (
                <>✅ Saved</>
              ) : (
                <>💾 Save CV</>
              )}
            </button>
          )}
          {cvData?.firstImpression?.videoUrl && (
            <button
              onClick={handleFirstImpression}
              className="hr-view-cv-video-button"
              title="View First Impression Video"
            >
              🎥 First Impression
            </button>
          )}
          <button
            onClick={handlePrint}
            className="hr-view-cv-print-button"
            title="Print CV"
          >
            🖨️ Print CV
          </button>
        </div>
      </div>

      {/* Info Bar - Additional HR-specific info */}
      <div className="hr-view-cv-info-bar">
        <div className="hr-view-cv-container">
          <div className="cv-info-left">
            <h2 className="cv-candidate-name">{savedCVInfo.fullName}</h2>

            {/* Industries */}
            {savedCVInfo.industries && savedCVInfo.industries.length > 0 && (
              <div className="cv-view-industries">
                {savedCVInfo.industries.map((industry, index) => (
                  <span key={index} className="cv-view-industry-tag">
                    {industry}
                  </span>
                ))}
              </div>
            )}

            {isPreviewMode ? (
              <div className="cv-stats">
                <span className="cv-stat">
                  📋 Preview Mode - CV not saved yet
                </span>
                <span className="cv-stat">
                  👁️ {savedCVInfo.viewCount}{' '}
                  {savedCVInfo.viewCount === 1 ? 'HR view' : 'HR views'}
                </span>
                <span className="cv-stat">
                  📅 Listed {formatDate(savedCVInfo.listedAt).split(',')[0]}
                </span>
              </div>
            ) : (
              <div className="cv-stats">
                <span className="cv-stat">
                  👁️ {savedCVInfo.viewCount}{' '}
                  {savedCVInfo.viewCount === 1 ? 'view' : 'views'}
                </span>
                <span className="cv-stat">
                  💾 Saved {formatDate(savedCVInfo.dateSaved).split(',')[0]}
                </span>
                <span className="cv-stat">
                  🕐 Last viewed{' '}
                  {formatDate(savedCVInfo.lastViewed).split(',')[0]}
                </span>
              </div>
            )}
          </div>
          <div className="cv-info-right">
            {!isPreviewMode && (
              <>
                <button
                  onClick={() => setShowNotesPanel(!showNotesPanel)}
                  className="hr-view-cv-notes-button"
                  title="Toggle Notes Panel"
                >
                  📝 Notes{' '}
                  {savedCVInfo.notes?.length > 0 &&
                    `(${savedCVInfo.notes.length})`}
                </button>
                <label htmlFor="rank-select" className="rank-label">
                  Rank:
                </label>
                <select
                  id="rank-select"
                  value={selectedRank}
                  onChange={handleRankChange}
                  className="rank-select"
                  style={{ borderColor: getRankColor(selectedRank) }}
                  disabled={isUpdatingRank}
                >
                  <option value="null">Unrated</option>
                  <option value="excellent">⭐ Excellent</option>
                  <option value="good">👍 Good</option>
                  <option value="fair">👌 Fair</option>
                  <option value="poor">👎 Poor</option>
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CV Preview Container - EXACTLY matches ViewCV structure */}
      <div className="cv-preview-container">
        {printMode === 'ink-friendly' ? (
          <InkFriendlyTemplate cvData={cvData} />
        ) : (
          renderTemplate()
        )}

        {/* Floating Certificates Button */}
        {cvData?.certificates?.length > 0 &&
          !showNotesPanel &&
          !showPrintOptions &&
          !showFirstImpression &&
          !showCertificates && (
            <button
              onClick={handleCertificates}
              className="floating-certificates-button"
              title={`View ${cvData.certificates.length} Certificate${cvData.certificates.length > 1 ? 's' : ''}`}
            >
              <span className="certificates-icon">📋</span>
              <span className="certificates-count">
                {cvData.certificates.length}
              </span>
            </button>
          )}
      </div>

      {/* Notes Panel - Overlay/Side Panel (doesn't affect main structure) */}
      {showNotesPanel && !isPreview && (
        <div
          className="hr-notes-panel-overlay"
          onClick={e => {
            // Close panel when clicking overlay background
            if (e.target === e.currentTarget) {
              setShowNotesPanel(false);
            }
          }}
        >
          <div className="hr-notes-panel" onClick={e => e.stopPropagation()}>
            <div className="notes-panel-header">
              <h3>📝 Notes</h3>
              <button
                onClick={() => setShowNotesPanel(false)}
                className="notes-panel-close"
              >
                ✕
              </button>
            </div>

            {/* Add Note Form */}
            <div className="add-note-form">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note about this candidate..."
                className="note-textarea"
                rows="3"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isSavingNote}
                className="btn-add-note"
              >
                {isSavingNote ? 'Saving...' : 'Add Note'}
              </button>
            </div>

            {/* Notes List */}
            <div className="notes-list">
              {savedCVInfo.notes && savedCVInfo.notes.length > 0 ? (
                savedCVInfo.notes
                  .slice()
                  .reverse()
                  .map(note => (
                    <div key={note._id} className="note-item">
                      {deleteConfirmId === note._id ? (
                        <div className="note-delete-confirm">
                          <p className="note-delete-message">
                            Delete this note?
                          </p>
                          <div className="note-delete-actions">
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="btn-confirm-delete"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              className="btn-cancel-delete"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="note-content">{note.content}</div>
                          <div className="note-footer">
                            <span className="note-date">
                              {formatDate(note.createdAt)}
                            </span>
                            <button
                              onClick={() => setDeleteConfirmId(note._id)}
                              className="btn-delete-note"
                              title="Delete note"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
              ) : (
                <div className="notes-empty">
                  <p>No notes yet. Add your first note above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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
        fullName={
          cvData?.personalInfo?.fullName ||
          (cvData?.personalInfo?.firstName && cvData?.personalInfo?.lastName
            ? `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`
            : null) ||
          cvData?.personalInfo?.name
        }
        createdDate={cvData?.firstImpression?.created}
      />

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

export default HRViewCV;
