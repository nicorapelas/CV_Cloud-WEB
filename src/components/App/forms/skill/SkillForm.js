import React, { useState, useEffect, useContext, useRef } from 'react';
import { Context as AuthContext } from '../../../../context/AuthContext';
import { Context as SkillContext } from '../../../../context/SkillContext';
import { useRealTime } from '../../../../context/RealTimeContext';
import { Trash, Pencil } from 'lucide-react';
import './SkillForm.css';

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

const SkillForm = () => {
  const {
    state: { user },
  } = useContext(AuthContext);
  const {
    state: { skills, loading: contextLoading, error },
    fetchSkills,
    createSkill,
    editSkill,
    deleteSkill,
    clearSkillErrors,
  } = useContext(SkillContext);

  const { lastUpdate, hasRecentUpdate, authenticateUser, sendUserActivity } =
    useRealTime();

  // Ref for scrolling to top
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    skill: '',
    proficiency: '',
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

  // Update form data when skills from context changes
  useEffect(() => {
    if (skills && skills.length > 0) {
      // If we have data, clear the form for new entry
      setFormData({
        skill: '',
        proficiency: '',
      });
      setEditingId(null);
    }
  }, [skills]);

  // Update form visibility when skills changes
  useEffect(() => {
    console.log('skills', skills);

    // Show form when there are no skills, hide when there are skills and not editing
    if (!skills || skills.length === 0) {
      setShowForm(true);
    } else if (skills.length > 0 && !editingId) {
      setShowForm(false);
    }
  }, [skills, editingId]); // Dependency on skills and editingId

  // Handle real-time updates
  useEffect(() => {
    if (lastUpdate && lastUpdate.dataType === 'skill') {
      console.log('🔄 Skill update received:', lastUpdate);

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
        fetchSkills().finally(() => {
          setIsRefreshing(false);
        });
      }, 500);
    }
  }, [lastUpdate, fetchSkills]);

  // Fetch skills on user change
  useEffect(() => {
    if (user) {
      console.log('🔄 Setting up skills for user:', user.id);

      // Fetch skills data
      fetchSkills();
    }
  }, [user, fetchSkills]);

  // Check for recent updates and refresh if needed
  useEffect(() => {
    if (user && hasRecentUpdate('skill', 2) && !isRefreshing) {
      // Check last 2 minutes
      console.log(
        '🔄 Recent update detected, checking if refresh is needed...'
      );

      // Only refresh if we don't have current data or if it's been more than 5 seconds since last refresh
      const now = Date.now();
      const shouldRefresh =
        !skills ||
        skills.length === 0 ||
        !lastRefreshTimestamp.current ||
        now - lastRefreshTimestamp.current > 5000;

      if (shouldRefresh) {
        console.log('🔄 Refreshing data due to recent update...');
        setIsRefreshing(true);
        lastRefreshTimestamp.current = now;
        fetchSkills().finally(() => {
          setIsRefreshing(false);
        });
      } else {
        console.log('🔄 Skipping refresh - data is current');
      }
    }
  }, [user, hasRecentUpdate, skills, isRefreshing, fetchSkills]);

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

    if (!formData.skill.trim()) {
      newErrors.skill = 'Skill is required';
    } else if (formData.skill.length > 100) {
      newErrors.skill = 'Skill must be 100 characters or less';
    }

    if (
      formData.proficiency &&
      (formData.proficiency < 1 || formData.proficiency > 5)
    ) {
      newErrors.proficiency = 'Proficiency must be between 1 and 5';
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
        await editSkill({ id: editingId }, formData);
        setSuccessMessage('Skill updated successfully!');
        setEditingId(null);
      } else {
        await createSkill(formData);
        setSuccessMessage('Skill added successfully!');
      }

      // Clear form after successful submission
      setFormData({
        skill: '',
        proficiency: '',
      });

      // Clear errors
      clearSkillErrors();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Hide form after successful submission if there are skills
      if (skills && skills.length > 0 && !editingId) {
        setTimeout(() => {
          setShowForm(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting skill:', error);
    }
  };

  const handleEdit = skill => {
    setFormData({
      skill: skill.skill || '',
      proficiency: skill.proficiency || '',
    });
    setEditingId(skill._id);
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
      skill: '',
      proficiency: '',
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
      skill: '',
      proficiency: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setFormData({
      skill: '',
      proficiency: '',
    });
    setEditingId(null);
    setErrors({});
    setSuccessMessage('');

    // Hide form if there are skills
    if (skills && skills.length > 0 && !editingId) {
      setShowForm(false);
    }
  };

  const handleDeleteClick = skillId => {
    setDeletingId(skillId);
  };

  const confirmDelete = async skillId => {
    try {
      await deleteSkill(skillId);
      setSuccessMessage('Skill deleted successfully!');

      // Clear form if we were editing the deleted entry
      if (editingId === skillId) {
        setFormData({
          skill: '',
          proficiency: '',
        });
        setEditingId(null);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting skill:', error);
      setErrors({ submit: 'Failed to delete skill. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="skill-form">
      <div className="skill-form-container" ref={formTopRef}>
        <div className="skill-form-header">
          <div className="skill-form-header-icon">⚡</div>
          <div className="skill-form-header-content">
            <h2>Skills</h2>
            <p>Add your key skills and competencies</p>
          </div>
        </div>

        {successMessage && (
          <div className="skill-form-success">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="form-error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Show "Add Skill" button when there are skills and form is hidden */}
        {skills && skills.length > 0 && !showForm && !editingId && (
          <div className="skill-add-section">
            <button
              type="button"
              className="skill-add-button"
              onClick={handleShowForm}
            >
              Add Skill
            </button>
          </div>
        )}

        {/* Show form when there are no skills, or when explicitly shown, or when editing */}
        {(!skills || skills.length === 0 || showForm || editingId) && (
          <form
            onSubmit={handleSubmit}
            className={`skill-form-element ${showForm ? 'skill-form-slide-down' : ''}`}
          >
            <div className="skill-form-section">
              <div className="skill-form-field">
                <label htmlFor="skill" className="skill-form-label">
                  Skill <span className="skill-required">*</span>
                </label>
                <input
                  type="text"
                  id="skill"
                  name="skill"
                  value={formData.skill}
                  onChange={handleInputChange}
                  className={`skill-form-input ${errors.skill ? 'skill-form-error' : ''}`}
                  placeholder="Enter a skill (e.g., JavaScript, Project Management, etc.)"
                  maxLength={100}
                />
                {errors.skill && (
                  <div className="skill-form-error-message">{errors.skill}</div>
                )}
                <div className="skill-form-char-count">
                  {formData.skill.length}/100
                </div>
              </div>

              <div className="skill-form-field">
                <label className="skill-form-label">
                  How good are you at {formData.skill || 'this skill'}?
                </label>
                <div className="skill-proficiency-radio">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} className="proficiency-option">
                      <input
                        type="radio"
                        id={`proficiency-${level}`}
                        name="proficiency"
                        value={level}
                        checked={formData.proficiency == level}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            proficiency: parseInt(e.target.value),
                          }));
                          // Clear field-specific error when user makes selection
                          if (errors.proficiency) {
                            setErrors(prev => ({
                              ...prev,
                              proficiency: '',
                            }));
                          }
                          // Clear success message when user makes changes
                          if (successMessage) {
                            setSuccessMessage('');
                          }
                        }}
                        className="proficiency-radio"
                      />
                      <label
                        htmlFor={`proficiency-${level}`}
                        className="proficiency-label"
                      >
                        <span className="proficiency-dot">
                          {formData.proficiency === level ? '●' : '○'}
                        </span>
                        <span className="proficiency-number">{level}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {formData.proficiency && (
                  <div className="proficiency-description">
                    {formData.proficiency === 1 && 'Novice'}
                    {formData.proficiency === 2 && 'Beginner'}
                    {formData.proficiency === 3 && 'Skilled'}
                    {formData.proficiency === 4 && 'Experienced'}
                    {formData.proficiency === 5 && 'Expert'}
                  </div>
                )}
                {errors.proficiency && (
                  <div className="skill-form-error-message">
                    {errors.proficiency}
                  </div>
                )}
              </div>
            </div>

            {successMessage && (
              <div style={{ paddingTop: '20px', display: 'block' }}>
                <div className="skill-form-success">{successMessage}</div>
              </div>
            )}
            {error && <div className="skill-form-error-message">{error}</div>}

            <div className="skill-form-actions">
              {!editingId && (
                <button
                  type="button"
                  className="skill-form-button secondary"
                  onClick={handleHideForm}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="skill-form-button primary"
                disabled={contextLoading}
              >
                {contextLoading
                  ? editingId
                    ? 'Updating...'
                    : 'Adding...'
                  : editingId
                    ? 'Update Skill'
                    : 'Add Skill'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="skill-form-button secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Display existing skills */}
        {skills && skills.length > 0 && (
          <div className="skills-list">
            <h3>Your Skills</h3>
            {skills.map(skill => (
              <div key={skill._id} className="skill-item">
                <div className="skill-content">
                  <div className="skill-title-section">
                    <span className="skill-dot">●</span>
                    <h4 className="skill-title">{skill.skill}</h4>
                  </div>
                  {skill.proficiency && (
                    <div className="skill-proficiency-section">
                      <ProficiencyDots level={skill.proficiency} />
                    </div>
                  )}
                </div>
                <div className="skill-actions-section">
                  {deletingId === skill._id ? (
                    <div className="delete-confirmation">
                      <div className="delete-confirmation-text-container">
                        <span className="delete-confirmation-text">
                          Delete this skill?
                        </span>
                      </div>
                      <div className="delete-confirmation-buttons">
                        <button
                          type="button"
                          className="confirm-delete-button"
                          onClick={() => confirmDelete(skill._id)}
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
                    <div className="skill-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleEdit(skill)}
                        title="Edit skill"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteClick(skill._id)}
                        title="Delete skill"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="skill-date">
                  Last updated:{' '}
                  {new Date(skill.lastUpdate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillForm;
