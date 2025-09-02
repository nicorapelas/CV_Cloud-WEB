import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as LanguageContext } from '../../../../context/LanguageContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil } from 'lucide-react';
import './LanguageForm.css';

// Proficiency Dots Component
const ProficiencyDots = ({ level }) => {
  const dots = [];
  for (let i = 1; i <= 5; i++) {
    dots.push(
      <span
        key={i}
        className={`proficiency-dot ${i <= level ? 'filled' : 'empty'}`}
      >
        ●
      </span>
    );
  }
  return <div className="proficiency-dots">{dots}</div>;
};

const LanguageForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);
  const {
    state: { languages, loading: contextLoading, error },
    fetchLanguages,
    createLanguage,
    editLanguage,
    deleteLanguage,
    clearLanguageErrors,
  } = useContext(LanguageContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    language: '',
    read: '',
    write: '',
    speak: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // Start with form hidden

  // Ref to track last refresh to prevent multiple rapid refreshes
  const lastRefreshTimestamp = useRef(null);

  // Scroll to top when component mounts
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

  // Update form data when languages from context changes
  useEffect(() => {
    if (languages && languages.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        language: '',
        read: '',
        write: '',
        speak: '',
      });
      setEditingId(null);
    }
  }, [languages]);

  // Update form visibility when languages changes
  useEffect(() => {
    console.log('languages', languages);

    // Show form when there are no languages, hide when there are languages and not editing
    if (!languages || languages.length === 0) {
      setShowForm(true);
    } else if (languages.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [languages, editingId]); // Dependency on languages and editingId

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'language') {
      console.log('🔄 Language update received:', lastUpdate);

      // Prevent multiple rapid refreshes (within 2 seconds)
      const now = Date.now();
      if (
        lastRefreshTimestamp.current &&
        now - lastRefreshTimestamp.current < 2000
      ) {
        console.log('🔄 Skipping refresh - too soon since last refresh');
        return;
      }

      setIsRefreshing(true);
      lastRefreshTimestamp.current = now;

      // Fetch updated data with a small delay to ensure server has processed the update
      setTimeout(() => {
        fetchLanguages().finally(() => {
          setIsRefreshing(false);
        });
      }, 500);
    }
  }, [lastUpdate, fetchLanguages]);

  // Fetch languages on user change
  useEffect(() => {
    if (user) {
      console.log('🔄 Setting up languages for user:', user.id);

      // Fetch languages data
      fetchLanguages();
    }
  }, [user, fetchLanguages]);

  // Check for recent updates and refresh if needed
  useEffect(() => {
    if (user && hasRecentUpdate('language', 2) && !isRefreshing) {
      // Check last 2 minutes
      console.log(
        '🔄 Recent update detected, checking if refresh is needed...'
      );

      // Only refresh if we don't have current data or if it's been more than 5 seconds since last refresh
      const now = Date.now();
      const shouldRefresh =
        !languages ||
        languages.length === 0 ||
        !lastRefreshTimestamp.current ||
        now - lastRefreshTimestamp.current > 5000;

      if (shouldRefresh) {
        console.log('🔄 Refreshing data due to recent update...');
        setIsRefreshing(true);
        lastRefreshTimestamp.current = now;
        fetchLanguages().finally(() => {
          setIsRefreshing(false);
        });
      } else {
        console.log('🔄 Skipping refresh - data is current');
      }
    }
  }, [user, hasRecentUpdate, languages, isRefreshing, fetchLanguages]);

  // Auto-scroll when success message is displayed
  useEffect(() => {
    if (successMessage) {
      const scrollToTop = () => {
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      };
      setTimeout(scrollToTop, 100);
    }
  }, [successMessage]);

  // Auto-scroll when error messages are displayed
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const scrollToTop = () => {
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      };
      setTimeout(scrollToTop, 100);
    }
  }, [errors]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.language.trim()) {
      newErrors.language = 'Language is required';
    } else if (formData.language.length > 50) {
      newErrors.language = 'Language must be 50 characters or less';
    }

    if (formData.read && (formData.read < 1 || formData.read > 5)) {
      newErrors.read = 'Reading proficiency must be between 1 and 5';
    }

    if (formData.write && (formData.write < 1 || formData.write > 5)) {
      newErrors.write = 'Writing proficiency must be between 1 and 5';
    }

    if (formData.speak && (formData.speak < 1 || formData.speak > 5)) {
      newErrors.speak = 'Speaking proficiency must be between 1 and 5';
    }

    setErrors(newErrors);

    // If there are errors, scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        // Cross-browser compatible scroll to error field
        const scrollToError = () => {
          if ('scrollBehavior' in document.documentElement.style) {
            errorElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          } else {
            // Fallback for older browsers or Firefox issues
            const elementTop = errorElement.offsetTop - 100; // 100px offset from top
            window.scrollTo(0, elementTop);
          }
        };
        setTimeout(scrollToError, 100);
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        await editLanguage({ id: editingId }, formData);
        setSuccessMessage('Language updated successfully!');
        setEditingId(null);
      } else {
        await createLanguage(formData);
        setSuccessMessage('Language added successfully!');
      }

      // Clear form after successful submission
      setFormData({
        language: '',
        read: '',
        write: '',
        speak: '',
      });

      // Clear errors
      clearLanguageErrors();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Hide form after successful submission if there are languages
      if (languages && languages.length > 0 && !editingId) {
        setTimeout(() => {
          setShowForm(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting language:', error);
    }
  };

  const handleEdit = language => {
    setFormData({
      language: language.language || '',
      read: language.read || '',
      write: language.write || '',
      speak: language.speak || '',
    });
    setEditingId(language._id);
    setShowForm(true); // Show form when editing

    // Smooth scroll to the very top of the page
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    };
    setTimeout(scrollToTop, 100);
  };

  const handleShowForm = () => {
    setShowForm(true);
    setFormData({
      language: '',
      read: '',
      write: '',
      speak: '',
    });
    setErrors({});
    setSuccessMessage('');

    // Smooth scroll to the very top of the page
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    };
    setTimeout(scrollToTop, 100);
  };

  const handleHideForm = () => {
    setShowForm(false);
    setFormData({
      language: '',
      read: '',
      write: '',
      speak: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setFormData({
      language: '',
      read: '',
      write: '',
      speak: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are languages
    if (languages && languages.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleDeleteClick = languageId => {
    setDeletingId(languageId);
  };

  const confirmDelete = async languageId => {
    try {
      await deleteLanguage(languageId);
      setSuccessMessage('Language deleted successfully!');

      // Clear form if we were editing the deleted entry
      if (editingId === languageId) {
        setFormData({
          language: '',
          read: '',
          write: '',
          speak: '',
        });
        setEditingId(null);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting language:', error);
      setErrors({ submit: 'Failed to delete language. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="language-form">
      <div className="language-form-container" ref={formTopRef}>
        <div className="language-form-header">
          <div className="language-form-header-icon">🌍</div>
          <div className="language-form-header-content">
            <h2>Languages</h2>
            <p>Add your language proficiencies</p>
          </div>
        </div>

        {successMessage && (
          <div className="language-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="language-form-error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Show "Add Language" button when there are languages and form is hidden */}
        {languages && languages.length > 0 && !showForm && !editingId && (
          <div className="language-add-section">
            <button
              type="button"
              className="language-add-button"
              onClick={handleShowForm}
            >
              Add Language
            </button>
          </div>
        )}

        {/* Show form when there are no languages, or when explicitly shown, or when editing */}
        {(!languages || languages.length === 0 || showForm || editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`language-form-element ${showForm ? 'language-form-slide-down' : ''}`}
          >
            <div className="language-form-section">
              <div className="language-form-field">
                <label htmlFor="language" className="language-form-label">
                  Language <span className="language-required">*</span>
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className={`language-form-input ${errors.language ? 'language-form-error' : ''}`}
                  placeholder="Enter language (e.g., English, Spanish, French, etc.)"
                  maxLength={50}
                />
                {errors.language && (
                  <div className="language-form-error-message">
                    {errors.language}
                  </div>
                )}
                <div className="language-form-char-count">
                  {formData.language.length}/50
                </div>
              </div>

              <div className="language-form-field">
                <label className="language-form-label">
                  How well can you read {formData.language || 'this language'}?
                </label>
                <div className="language-proficiency-radio">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} className="proficiency-option">
                      <input
                        type="radio"
                        id={`read-${level}`}
                        name="read"
                        value={level}
                        checked={formData.read == level}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            read: parseInt(e.target.value),
                          }));
                          if (errors.read) {
                            setErrors(prev => ({
                              ...prev,
                              read: '',
                            }));
                          }
                          if (successMessage) {
                            setSuccessMessage('');
                          }
                        }}
                        className="proficiency-radio"
                      />
                      <label
                        htmlFor={`read-${level}`}
                        className="proficiency-label"
                      >
                        <span className="proficiency-dot">
                          {formData.read === level ? '●' : '○'}
                        </span>
                        <span className="proficiency-number">{level}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {formData.read && (
                  <div className="proficiency-description">
                    {formData.read === 1 && 'Beginner'}
                    {formData.read === 2 && 'Elementary'}
                    {formData.read === 3 && 'Intermediate'}
                    {formData.read === 4 && 'Advanced'}
                    {formData.read === 5 && 'Proficient'}
                  </div>
                )}
                {errors.read && (
                  <div className="language-form-error-message">
                    {errors.read}
                  </div>
                )}
              </div>

              <div className="language-form-field">
                <label className="language-form-label">
                  How well can you write {formData.language || 'this language'}?
                </label>
                <div className="language-proficiency-radio">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} className="proficiency-option">
                      <input
                        type="radio"
                        id={`write-${level}`}
                        name="write"
                        value={level}
                        checked={formData.write == level}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            write: parseInt(e.target.value),
                          }));
                          if (errors.write) {
                            setErrors(prev => ({
                              ...prev,
                              write: '',
                            }));
                          }
                          if (successMessage) {
                            setSuccessMessage('');
                          }
                        }}
                        className="proficiency-radio"
                      />
                      <label
                        htmlFor={`write-${level}`}
                        className="proficiency-label"
                      >
                        <span className="proficiency-dot">
                          {formData.write === level ? '●' : '○'}
                        </span>
                        <span className="proficiency-number">{level}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {formData.write && (
                  <div className="proficiency-description">
                    {formData.write === 1 && 'Beginner'}
                    {formData.write === 2 && 'Elementary'}
                    {formData.write === 3 && 'Intermediate'}
                    {formData.write === 4 && 'Advanced'}
                    {formData.write === 5 && 'Proficient'}
                  </div>
                )}
                {errors.write && (
                  <div className="language-form-error-message">
                    {errors.write}
                  </div>
                )}
              </div>

              <div className="language-form-field">
                <label className="language-form-label">
                  How well can you speak {formData.language || 'this language'}?
                </label>
                <div className="language-proficiency-radio">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} className="proficiency-option">
                      <input
                        type="radio"
                        id={`speak-${level}`}
                        name="speak"
                        value={level}
                        checked={formData.speak == level}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            speak: parseInt(e.target.value),
                          }));
                          if (errors.speak) {
                            setErrors(prev => ({
                              ...prev,
                              speak: '',
                            }));
                          }
                          if (successMessage) {
                            setSuccessMessage('');
                          }
                        }}
                        className="proficiency-radio"
                      />
                      <label
                        htmlFor={`speak-${level}`}
                        className="proficiency-label"
                      >
                        <span className="proficiency-dot">
                          {formData.speak === level ? '●' : '○'}
                        </span>
                        <span className="proficiency-number">{level}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {formData.speak && (
                  <div className="proficiency-description">
                    {formData.speak === 1 && 'Beginner'}
                    {formData.speak === 2 && 'Elementary'}
                    {formData.speak === 3 && 'Intermediate'}
                    {formData.speak === 4 && 'Advanced'}
                    {formData.speak === 5 && 'Proficient'}
                  </div>
                )}
                {errors.speak && (
                  <div className="language-form-error-message">
                    {errors.speak}
                  </div>
                )}
              </div>
            </div>

            {successMessage && (
              <div style={{ paddingTop: '20px', display: 'block' }}>
                <div className="language-form-success">{successMessage}</div>
              </div>
            )}
            {error && (
              <div className="language-form-error-message">{error}</div>
            )}

            <div className="language-form-actions">
              {!editingId && (
                <button
                  type="button"
                  className="language-form-button secondary"
                  onClick={handleHideForm}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="language-form-button primary"
                disabled={contextLoading}
              >
                {contextLoading
                  ? editingId
                    ? 'Updating...'
                    : 'Adding...'
                  : editingId
                    ? 'Update Language'
                    : 'Add Language'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="language-form-button secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Display existing languages */}
        {languages && languages.length > 0 && (
          <div className="languages-list">
            <h3>Your Languages</h3>
            {languages.map(language => (
              <div key={language._id} className="language-item">
                <div className="language-content">
                  <div className="language-title-section">
                    <span className="language-dot">●</span>
                    <h4 className="language-title">{language.language}</h4>
                  </div>
                  <div className="language-proficiencies-section">
                    {language.read && (
                      <div className="language-proficiency-item">
                        <span className="proficiency-label">Read:</span>
                        <ProficiencyDots level={language.read} />
                      </div>
                    )}
                    {language.write && (
                      <div className="language-proficiency-item">
                        <span className="proficiency-label">Write:</span>
                        <ProficiencyDots level={language.write} />
                      </div>
                    )}
                    {language.speak && (
                      <div className="language-proficiency-item">
                        <span className="proficiency-label">Speak:</span>
                        <ProficiencyDots level={language.speak} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="language-actions-date-container">
                  <div className="language-actions-section">
                    {deletingId === language._id ? (
                      <div className="delete-confirmation">
                        <div className="delete-confirmation-text-container">
                          <span className="delete-confirmation-text">
                            Delete this language?
                          </span>
                        </div>
                        <div className="delete-confirmation-buttons">
                          <button
                            type="button"
                            className="confirm-delete-button"
                            onClick={() => confirmDelete(language._id)}
                          >
                            Yes, Delete
                          </button>
                          <button
                            type="button"
                            className="cancel-delete-button"
                            onClick={cancelDelete}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="language-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEdit(language)}
                          title="Edit language"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteClick(language._id)}
                          title="Delete language"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="language-date">
                    Last updated:{' '}
                    {new Date(language.lastUpdate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageForm;
