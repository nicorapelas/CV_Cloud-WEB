import React from 'react';
import moment from 'moment';
import './template09.css';

const Template09 = ({ cvData }) => {
  const {
    personalInfo,
    contactInfo,
    personalSummary,
    experiences,
    secondEdu,
    skills,
    languages,
    references,
    tertEdus,
    interests,
    attributes,
    employHistorys,
    assignedPhotoUrl,
  } = cvData;

  // Helper function to format date
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return moment(date).format('MMM YYYY');
  };

  // Helper function to render proficiency bars
  const renderProficiency = level => {
    const percentage = Math.min((level / 5) * 100, 100);
    return (
      <div className="template09-proficiency-container">
        <div className="template09-proficiency-bar">
          <div
            className="template09-proficiency-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="template09-proficiency-text">{level}/5</span>
      </div>
    );
  };

  // Helper function to render subjects array
  const renderSubjects = subjects => {
    if (!subjects || subjects.length === 0) return null;
    return subjects.map((subject, index) => (
      <span key={subject._id || index} className="template09-subject-tag">
        {subject.subject}
      </span>
    ));
  };

  return (
    <div className="template09-industrial">
      {/* Industrial Header */}
      <header className="template09-header">
        <div className="template09-header-content">
          <div className="template09-logo-section">
            <div className="template09-logo">
              <div className="template09-gears-container">
                <div className="template09-gear template09-gear-large">
                  <div className="template09-gear-teeth"></div>
                  <div className="template09-gear-center"></div>
                </div>
                <div className="template09-gear template09-gear-small">
                  <div className="template09-gear-teeth"></div>
                  <div className="template09-gear-center"></div>
                </div>
                <div className="template09-gear template09-gear-medium">
                  <div className="template09-gear-teeth"></div>
                  <div className="template09-gear-center"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="template09-title-section">
            <h1 className="template09-name">
              {personalInfo?.fullName || 'PROFESSIONAL PROFILE'}
            </h1>
            <div className="template09-title">
              {personalSummary?.content?.split('.')[0] ||
                'Industrial Professional'}
            </div>
            <div className="template09-header-divider"></div>
          </div>
        </div>
        <div className="template09-header-pattern"></div>
      </header>

      {/* Contact Information */}
      <section className="template09-contact-section">
        <div className="template09-contact-grid">
          {contactInfo?.email && (
            <div className="template09-contact-item">
              <div className="template09-contact-icon">📧</div>
              <div className="template09-contact-details">
                <span className="template09-contact-label">Email</span>
                <span className="template09-contact-value">
                  {contactInfo.email}
                </span>
              </div>
            </div>
          )}
          {contactInfo?.phone && (
            <div className="template09-contact-item">
              <div className="template09-contact-icon">📞</div>
              <div className="template09-contact-details">
                <span className="template09-contact-label">Phone</span>
                <span className="template09-contact-value">
                  {contactInfo.phone}
                </span>
              </div>
            </div>
          )}
          {(contactInfo?.address || contactInfo?.city) && (
            <div className="template09-contact-item">
              <div className="template09-contact-icon">📍</div>
              <div className="template09-contact-details">
                <span className="template09-contact-label">Location</span>
                <span className="template09-contact-value">
                  {[
                    contactInfo.address,
                    contactInfo.suburb,
                    contactInfo.city,
                    contactInfo.province,
                    contactInfo.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Photo Section */}
      {assignedPhotoUrl && (
        <section className="template09-photo-section">
          <div className="template09-photo-container">
            <img
              src={assignedPhotoUrl}
              alt="Profile"
              className="template09-profile-photo"
            />
            <div className="template09-photo-frame"></div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="template09-main">
        {/* Professional Summary */}
        {personalSummary && (
          <section className="template09-section">
            <div className="template09-section-header">
              <div className="template09-section-icon">⚡</div>
              <h2 className="template09-section-title">
                PROFESSIONAL OVERVIEW
              </h2>
            </div>
            <div className="template09-section-content">
              <div className="template09-summary-box">
                <p className="template09-summary-text">
                  {personalSummary.content}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Two Column Layout */}
        <div className="template09-columns">
          {/* Left Column */}
          <div className="template09-left-column">
            {/* Work Experience */}
            {experiences && experiences.length > 0 && (
              <section className="template09-section">
                <div className="template09-section-header">
                  <div className="template09-section-icon">🔧</div>
                  <h2 className="template09-section-title">WORK EXPERIENCE</h2>
                </div>
                <div className="template09-section-content">
                  {experiences.map((experience, index) => (
                    <div
                      key={experience._id || index}
                      className="template09-experience-item"
                    >
                      <div className="template09-experience-header">
                        <div className="template09-experience-title">
                          <h3 className="template09-experience-name">
                            {experience.title}
                          </h3>
                          {experience.company && (
                            <div className="template09-experience-company">
                              {experience.company}
                            </div>
                          )}
                        </div>
                        {(experience.startDate || experience.endDate) && (
                          <div className="template09-experience-dates">
                            {experience.startDate
                              ? formatDate(experience.startDate)
                              : 'Start Date'}{' '}
                            -{' '}
                            {experience.endDate
                              ? formatDate(experience.endDate)
                              : 'Present'}
                          </div>
                        )}
                      </div>
                      {experience.description && (
                        <div className="template09-experience-description">
                          {experience.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Employment History */}
            {employHistorys && employHistorys.length > 0 && (
              <section className="template09-section">
                <div className="template09-section-header">
                  <div className="template09-section-icon">🏭</div>
                  <h2 className="template09-section-title">
                    EMPLOYMENT HISTORY
                  </h2>
                </div>
                <div className="template09-section-content">
                  {employHistorys.map((employment, index) => (
                    <div
                      key={employment._id || index}
                      className="template09-employment-item"
                    >
                      <div className="template09-employment-header">
                        <div className="template09-employment-title">
                          <h3 className="template09-employment-name">
                            {employment.position}
                          </h3>
                          <div className="template09-employment-company">
                            {employment.company}
                          </div>
                        </div>
                        <div className="template09-employment-dates">
                          {formatDate(employment.startDate)} -{' '}
                          {employment.endDate
                            ? formatDate(employment.endDate)
                            : 'Present'}
                        </div>
                      </div>
                      {employment.description && (
                        <div className="template09-employment-description">
                          {employment.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {(tertEdus && tertEdus.length > 0) ||
            (secondEdu && secondEdu.length > 0) ? (
              <section className="template09-section">
                <div className="template09-section-header">
                  <div className="template09-section-icon">🎓</div>
                  <h2 className="template09-section-title">EDUCATION</h2>
                </div>
                <div className="template09-section-content">
                  {/* Tertiary Education */}
                  {tertEdus &&
                    tertEdus.map((education, index) => (
                      <div
                        key={education._id || index}
                        className="template09-education-item"
                      >
                        <div className="template09-education-header">
                          <div className="template09-education-title">
                            <h3 className="template09-education-name">
                              {education.certificationType ||
                                'Tertiary Education'}
                            </h3>
                            <div className="template09-education-institution">
                              {education.instituteName}
                            </div>
                          </div>
                          <div className="template09-education-dates">
                            {formatDate(education.startDate)} -{' '}
                            {education.endDate
                              ? formatDate(education.endDate)
                              : 'Present'}
                          </div>
                        </div>
                        {education.description && (
                          <div className="template09-education-description">
                            {education.description}
                          </div>
                        )}
                        {education.additionalInfo && (
                          <div className="template09-education-additional">
                            {education.additionalInfo}
                          </div>
                        )}
                        {education.subjects && (
                          <div className="template09-education-subjects">
                            {renderSubjects(education.subjects)}
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Secondary Education */}
                  {secondEdu &&
                    secondEdu.map((education, index) => (
                      <div
                        key={education._id || index}
                        className="template09-education-item"
                      >
                        <div className="template09-education-header">
                          <div className="template09-education-title">
                            <h3 className="template09-education-name">
                              Secondary Education
                            </h3>
                            <div className="template09-education-institution">
                              {education.schoolName}
                            </div>
                          </div>
                          <div className="template09-education-dates">
                            {formatDate(education.startDate)} -{' '}
                            {education.endDate
                              ? formatDate(education.endDate)
                              : 'Present'}
                          </div>
                        </div>
                        {education.additionalInfo && (
                          <div className="template09-education-additional">
                            {education.additionalInfo}
                          </div>
                        )}
                        {education.subjects && (
                          <div className="template09-education-subjects">
                            {renderSubjects(education.subjects)}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Right Column */}
          <div className="template09-right-column">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <section className="template09-section">
                <div className="template09-section-header">
                  <div className="template09-section-icon">⚙️</div>
                  <h2 className="template09-section-title">TECHNICAL SKILLS</h2>
                </div>
                <div className="template09-section-content">
                  {skills.map((skill, index) => (
                    <div
                      key={skill._id || index}
                      className="template09-skill-item"
                    >
                      <div className="template09-skill-header">
                        <span className="template09-skill-name">
                          {skill.skill}
                        </span>
                        {renderProficiency(skill.proficiency)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <section className="template09-section">
                <div className="template09-section-header">
                  <div className="template09-section-icon">🌐</div>
                  <h2 className="template09-section-title">LANGUAGES</h2>
                </div>
                <div className="template09-section-content">
                  {languages.map((language, index) => (
                    <div
                      key={language._id || index}
                      className="template09-language-item"
                    >
                      <div className="template09-language-header">
                        <span className="template09-language-name">
                          {language.language}
                        </span>
                        <span className="template09-language-level">
                          {language.proficiency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Personal Attributes */}
            {attributes && attributes.length > 0 && (
              <section className="template09-section">
                <div className="template09-section-header">
                  <div className="template09-section-icon">💪</div>
                  <h2 className="template09-section-title">
                    PERSONAL ATTRIBUTES
                  </h2>
                </div>
                <div className="template09-section-content">
                  <div className="template09-attributes-grid">
                    {attributes.map((attribute, index) => (
                      <div
                        key={attribute._id || index}
                        className="template09-attribute-tag"
                      >
                        {attribute.attribute}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Interests */}
            {interests && interests.length > 0 && (
              <section className="template09-section">
                <div className="template09-section-header">
                  <div className="template09-section-icon">🎯</div>
                  <h2 className="template09-section-title">INTERESTS</h2>
                </div>
                <div className="template09-section-content">
                  <div className="template09-interests-grid">
                    {interests.map((interest, index) => (
                      <div
                        key={interest._id || index}
                        className="template09-interest-tag"
                      >
                        {interest.interest}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* References */}
        {references && references.length > 0 && (
          <section className="template09-section">
            <div className="template09-section-header">
              <div className="template09-section-icon">📋</div>
              <h2 className="template09-section-title">REFERENCES</h2>
            </div>
            <div className="template09-section-content">
              <div className="template09-references-grid">
                {references.map((reference, index) => (
                  <div
                    key={reference._id || index}
                    className="template09-reference-item"
                  >
                    <div className="template09-reference-header">
                      <h3 className="template09-reference-name">
                        {reference.name}
                      </h3>
                    </div>
                    <div className="template09-reference-details">
                      <p>
                        {reference.position && (
                          <strong>{reference.position}</strong>
                        )}
                        {reference.position && reference.company && ' at '}
                        {reference.company}
                      </p>
                      {reference.email && <p>Email: {reference.email}</p>}
                      {reference.phone && <p>Phone: {reference.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Industrial Footer */}
      <footer className="template09-footer">
        <div className="template09-footer-content">
          <div className="template09-footer-text">
            Built for Industrial Excellence
          </div>
          <div className="template09-footer-pattern"></div>
        </div>
      </footer>
    </div>
  );
};

export default Template09;
