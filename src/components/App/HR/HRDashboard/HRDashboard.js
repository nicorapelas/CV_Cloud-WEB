import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as SaveCVContext } from '../../../../context/SaveCVContext';
import { Context as ClassifiedAdsContext } from '../../../../context/ClassifiedAdsContext';
import hrLogo from '../../../../assets/images/logo-hr.png';
import DashSwapLoader from '../../../common/DashSwapLoader/DashSwapLoader';
import socketService from '../../../../services/socketService';
import TokenModal from './TokenModal';
import './HRDashboard.css';

const HRDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState('all');
  const [sortBy, setSortBy] = useState('dateSaved');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Loader state
  const [showLoader, setShowLoader] = useState(false);
  const [switchingTo, setSwitchingTo] = useState('dashboard');

  const navigate = useNavigate();

  const {
    state: { user, initLoginDone },
    signout,
    setInitLoginDone,
  } = useContext(AuthContext);

  const {
    state: { loading, savedCVs },
    fetchSavedCVs,
    deleteSavedCV,
    handleCVUpdated,
  } = useContext(SaveCVContext);

  const { state: { classifiedAdsActive } } = useContext(ClassifiedAdsContext);

  // Auto-scroll to top when component mounts
  useEffect(() => {
    // Cross-browser compatible scroll to top
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        // Modern browsers with smooth scrolling support
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback for older browsers or Firefox issues
        window.scrollTo(0, 0);
      }
    };

    // Small delay to ensure component is fully rendered
    setTimeout(scrollToTop, 100);
  }, []);

  useEffect(() => {
    if (!initLoginDone) {
      setInitLoginDone(true);
    }
  }, [initLoginDone, setInitLoginDone]);

  // Fetch saved CVs on component mount
  useEffect(() => {
    fetchSavedCVs();
  }, [fetchSavedCVs]);

  // Socket.IO real-time updates for CV changes
  useEffect(() => {
    const onCVUpdated = data => {
      console.log('✨ CV updated event received:', data);
      handleCVUpdated(data); // Call the context action
    };

    // Add listener
    socketService.addEventListener('saved-cv-updated', onCVUpdated);

    // Cleanup
    return () => {
      socketService.removeEventListener('saved-cv-updated', onCVUpdated);
    };
  }, [handleCVUpdated]);

  const handleSignout = () => {
    signout();
  };

  const handleSwitchToDashboard = () => {
    // Show loader first
    setSwitchingTo('dashboard');
    setShowLoader(true);

    // Navigate after 3 seconds
    setTimeout(() => {
      navigate('/app/dashboard');
      setShowLoader(false);
    }, 3000);
  };

  // Count recently updated CVs
  const updatedCount = (savedCVs || []).filter(
    cv => cv.hasUnviewedUpdate
  ).length;

  // Filter and search CVs
  const filteredCVs = (savedCVs || [])
    .filter(cv => {
      const matchesSearch = cv.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRank = filterRank === 'all' || cv.rank === filterRank;
      return matchesSearch && matchesRank;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dateSaved':
          return new Date(b.dateSaved) - new Date(a.dateSaved);
        case 'lastViewed':
          return new Date(b.lastViewed) - new Date(a.lastViewed);
        case 'viewCount':
          return b.viewCount - a.viewCount;
        case 'fullName':
          return a.fullName?.localeCompare(b.fullName);
        default:
          return 0;
      }
    });

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
    });
  };

  const formatDateTime = dateString => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} at ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const getInitials = fullName => {
    return (
      fullName
        ?.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'CV'
    );
  };

  const handleDeleteCV = async curriculumVitaeID => {
    try {
      await deleteSavedCV(curriculumVitaeID);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('Failed to delete CV. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const calculateDaysAgo = date => {
    if (!date) return '';
    const now = new Date();
    const updated = new Date(date);
    const diffTime = Math.abs(now - updated);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <>
      {classifiedAdsActive && showTokenModal && (
        <TokenModal onClose={() => setShowTokenModal(false)} />
      )}
      <DashSwapLoader
        show={showLoader}
        switchingTo={switchingTo}
        delay={3000}
      />
      <div className="hr-dashboard">
        <header className="hr-dashboard-header">
          <div className="hr-dashboard-header-content">
            <div className="hr-dashboard-logo">
              <img
                src={hrLogo}
                alt="CV Cloud HR Logo"
                className="hr-dashboard-logo-image"
              />
            </div>

            {/* Desktop User Info and Actions */}
            <div className="hr-dashboard-user-info">
              <span>Welcome, {user?.fullName || 'HR Professional'}</span>
              <div className="hr-dashboard-header-actions">
                <button
                  onClick={() => navigate('/app/hr-browse-cvs')}
                  className="hr-dashboard-browse-button"
                >
                  🔍 Browse CVs
                </button>
                {classifiedAdsActive && (
                  <>
                    <button
                      onClick={() => setShowTokenModal(true)}
                      className="hr-dashboard-browse-button"
                      title="View token balance"
                    >
                      🪙 Tokens
                    </button>
                    <button
                      onClick={() => navigate('/app/hr-classified-ads')}
                      className="hr-dashboard-browse-button"
                    >
                      📋 My Ads
                    </button>
                  </>
                )}
                {user && user.isAdmin && (
                  <button
                    onClick={() => navigate('/app/admin')}
                    className="hr-dashboard-switch-button"
                    style={{
                      background:
                        'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                    }}
                  >
                    👑 Admin Panel
                  </button>
                )}
                <button
                  onClick={handleSwitchToDashboard}
                  className="hr-dashboard-switch-button"
                >
                  CV Dashboard
                </button>
                <button
                  onClick={handleSignout}
                  className="hr-dashboard-signout"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={handleMobileMenuToggle}
              className="hr-dashboard-mobile-menu-button"
              title="Menu"
            >
              <div className="hr-dashboard-hamburger">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <>
                <div
                  className="hr-dashboard-mobile-menu-backdrop"
                  onClick={handleMobileMenuClose}
                ></div>
                <div className="hr-dashboard-mobile-menu">
                  <div className="hr-dashboard-mobile-user-info">
                    Welcome, {user?.fullName || 'HR Professional'}
                  </div>
                  <button
                    onClick={() => {
                      navigate('/app/hr-browse-cvs');
                      handleMobileMenuClose();
                    }}
                    className="hr-dashboard-mobile-nav-button"
                  >
                    🔍 Browse CVs
                  </button>
                  {classifiedAdsActive && (
                    <>
                      <button
                        onClick={() => {
                          setShowTokenModal(true);
                          handleMobileMenuClose();
                        }}
                        className="hr-dashboard-mobile-nav-button"
                      >
                        🪙 Tokens
                      </button>
                      <button
                        onClick={() => {
                          navigate('/app/hr-classified-ads');
                          handleMobileMenuClose();
                        }}
                        className="hr-dashboard-mobile-nav-button"
                      >
                        📋 My Ads
                      </button>
                    </>
                  )}
                  {user && user.isAdmin && (
                    <button
                      onClick={() => {
                        navigate('/app/admin');
                        handleMobileMenuClose();
                      }}
                      className="hr-dashboard-mobile-nav-button admin-button"
                      style={{
                        background:
                          'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                      }}
                    >
                      👑 Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleSwitchToDashboard();
                      handleMobileMenuClose();
                    }}
                    className="hr-dashboard-mobile-nav-button"
                  >
                    CV Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleSignout();
                      handleMobileMenuClose();
                    }}
                    className="hr-dashboard-mobile-nav-button signout-button"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="hr-dashboard-main">
          <div className="hr-dashboard-container">
            {/* Stats Section */}
            <section className="hr-dashboard-stats">
              <div className="hr-dashboard-stat">
                <span className="hr-dashboard-stat-number">
                  {savedCVs.length}
                </span>
                <span className="hr-dashboard-stat-label">Total Saved CVs</span>
              </div>
              <div className="hr-dashboard-stat">
                <span className="hr-dashboard-stat-number">
                  {
                    savedCVs.filter(cv => {
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      return new Date(cv.dateSaved) > oneWeekAgo;
                    }).length
                  }
                </span>
                <span className="hr-dashboard-stat-label">This Week</span>
              </div>
              <div className="hr-dashboard-stat">
                <span className="hr-dashboard-stat-number">
                  {savedCVs.reduce(
                    (total, cv) => total + (cv.viewCount || 0),
                    0
                  )}
                </span>
                <span className="hr-dashboard-stat-label">Total Views</span>
              </div>
              <div className="hr-dashboard-stat">
                <span className="hr-dashboard-stat-number">
                  {savedCVs.filter(cv => cv.rank && cv.rank !== 'null').length}
                </span>
                <span className="hr-dashboard-stat-label">Rated CVs</span>
              </div>
            </section>

            {/* Search and Filter Section */}
            <section className="hr-dashboard-controls">
              <div className="hr-dashboard-search">
                <input
                  type="text"
                  placeholder="Search CVs by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="hr-dashboard-search-input"
                />
              </div>
              <div className="hr-dashboard-filters">
                <select
                  value={filterRank}
                  onChange={e => setFilterRank(e.target.value)}
                  className="hr-dashboard-filter-select"
                >
                  <option value="all">All Ranks</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="null">Unrated</option>
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="hr-dashboard-filter-select"
                >
                  <option value="dateSaved">Sort by Date Saved</option>
                  <option value="lastViewed">Sort by Last Viewed</option>
                  <option value="viewCount">Sort by View Count</option>
                  <option value="fullName">Sort by Name</option>
                </select>
              </div>
            </section>

            {/* Updated CVs Banner */}
            {updatedCount > 0 && (
              <div className="hr-dashboard-updated-banner">
                <div className="updated-banner-content">
                  <span className="updated-banner-icon">✨</span>
                  <span className="updated-banner-text">
                    {updatedCount} CV{updatedCount > 1 ? 's have' : ' has'}{' '}
                    recent updates
                  </span>
                </div>
              </div>
            )}

            {/* CVs Grid */}
            <section className="hr-dashboard-cvs">
              {loading ? (
                <div className="hr-dashboard-loading">
                  <div className="hr-dashboard-spinner"></div>
                  <p className="hr-dashboard-loading-text">
                    Loading saved CVs...
                  </p>
                </div>
              ) : filteredCVs.length === 0 ? (
                <div className="hr-dashboard-empty">
                  <div className="hr-dashboard-empty-icon">📄</div>
                  <h3 className="hr-dashboard-empty-title">No CVs Found</h3>
                  <p className="hr-dashboard-empty-text">
                    {searchTerm || filterRank !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start by saving CVs from shared links to build your talent pipeline.'}
                  </p>
                  {!searchTerm && filterRank === 'all' && (
                    <Link
                      to="/hr-introduction"
                      className="hr-dashboard-cta-button"
                    >
                      Learn How to Save CVs
                    </Link>
                  )}
                </div>
              ) : (
                <div className="hr-dashboard-cvs-grid">
                  {filteredCVs.map(cv => (
                    <div
                      key={cv._id}
                      className={`hr-dashboard-cv-card ${cv.hasUnviewedUpdate ? 'updated' : ''}`}
                    >
                      {/* Recently Updated Badge */}
                      {cv.hasUnviewedUpdate && cv.lastUpdatedByOwner && (
                        <div className="cv-updated-badge">
                          🆕 Updated {calculateDaysAgo(cv.lastUpdatedByOwner)}
                        </div>
                      )}

                      <div className="hr-dashboard-cv-header">
                        <div className="hr-dashboard-cv-avatar">
                          {cv.profilePicture ? (
                            <img
                              src={cv.profilePicture}
                              alt={cv.fullName}
                              className="hr-dashboard-cv-avatar-image"
                              onError={e => {
                                // Fallback to initials if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span
                            className="hr-dashboard-cv-avatar-initials"
                            style={{
                              display: cv.profilePicture ? 'none' : 'flex',
                            }}
                          >
                            {getInitials(cv.fullName)}
                          </span>
                        </div>
                        <div className="hr-dashboard-cv-info">
                          <h3 className="hr-dashboard-cv-name">
                            {cv.fullName || 'Unnamed CV'}
                          </h3>
                          <p className="hr-dashboard-cv-id">
                            ID: {cv.curriculumVitaeID}
                          </p>
                        </div>
                        {cv.rank && cv.rank !== 'null' && (
                          <div
                            className="hr-dashboard-cv-rank"
                            style={{ backgroundColor: getRankColor(cv.rank) }}
                          >
                            {cv.rank}
                          </div>
                        )}
                      </div>

                      <div className="hr-dashboard-cv-stats">
                        <div className="hr-dashboard-cv-stat">
                          <span className="hr-dashboard-cv-stat-number">
                            {cv.viewCount || 0}
                          </span>
                          <span className="hr-dashboard-cv-stat-label">
                            Views
                          </span>
                        </div>
                        <div className="hr-dashboard-cv-stat">
                          <span className="hr-dashboard-cv-stat-number">
                            {cv.notes?.length || 0}
                          </span>
                          <span className="hr-dashboard-cv-stat-label">
                            Notes
                          </span>
                        </div>
                      </div>

                      <div className="hr-dashboard-cv-dates">
                        <p className="hr-dashboard-cv-date">
                          <strong>Saved:</strong> {formatDateTime(cv.dateSaved)}
                        </p>
                        <p className="hr-dashboard-cv-date">
                          <strong>Last Viewed:</strong>{' '}
                          {formatDateTime(cv.lastViewed)}
                        </p>
                      </div>

                      <div className="hr-dashboard-cv-actions">
                        {deleteConfirmId === cv._id ? (
                          <div className="cv-delete-confirm">
                            <span className="delete-message">
                              Delete this CV?
                            </span>
                            <div className="delete-actions">
                              <button
                                onClick={() => handleDeleteCV(cv._id)}
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
                            <button
                              className="hr-dashboard-cv-action-button primary"
                              onClick={() => {
                                navigate(
                                  `/app/hr-view-cv/${cv.curriculumVitaeID}?from=dashboard`
                                );
                              }}
                            >
                              {cv.hasUnviewedUpdate
                                ? '👁️ View Updated CV'
                                : 'View CV'}
                            </button>

                            <button
                              className="hr-dashboard-cv-action-button secondary"
                              onClick={() => {
                                navigate(
                                  `/app/hr-view-cv/${cv.curriculumVitaeID}?from=dashboard&notes=true`
                                );
                              }}
                            >
                              Add Notes
                            </button>
                            <button
                              className="hr-dashboard-cv-action-button delete"
                              onClick={() => setDeleteConfirmId(cv._id)}
                              title="Delete saved CV"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>

                      {cv.notes && cv.notes.length > 0 && (
                        <div className="hr-dashboard-cv-notes">
                          <h4 className="hr-dashboard-cv-notes-title">
                            Recent Notes:
                          </h4>
                          {cv.notes.slice(0, 2).map((note, index) => (
                            <div key={index} className="hr-dashboard-cv-note">
                              <p className="hr-dashboard-cv-note-content">
                                {note.content}
                              </p>
                              <small className="hr-dashboard-cv-note-date">
                                {formatDate(note.createdAt)}
                              </small>
                            </div>
                          ))}
                          {cv.notes.length > 2 && (
                            <p className="hr-dashboard-cv-notes-more">
                              +{cv.notes.length - 2} more notes
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default HRDashboard;
