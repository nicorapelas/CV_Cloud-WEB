import React from 'react';
import moment from 'moment';
import './template01.css';

const Template01 = ({ cvData }) => {
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  // Helper function to render proficiency dots
  const renderProficiency = level => {
    const maxLevel = 5;
    const filledDots = Math.min(level, maxLevel);
    const emptyDots = maxLevel - filledDots;

    return (
      <div className="template01-skill-level">
        {[...Array(filledDots)].map((_, i) => (
          <div key={`filled-${i}`} className="template01-skill-dot filled" />
        ))}
        {[...Array(emptyDots)].map((_, i) => (
          <div key={`empty-${i}`} className="template01-skill-dot" />
        ))}
      </div>
    );
  };

  // Helper function to render subjects array
  const renderSubjects = subjects => {
    if (!subjects || !Array.isArray(subjects)) return '';
    return subjects.map(subject => subject.subject || subject).join(', ');
  };

  return (
    <div className="template01-wrapper">
      <div className="template01-container">
        {/* Header Section */}
        <header className="template01-header">
          <div className="template01-header-content">
            {assignedPhotoUrl && assignedPhotoUrl !== 'noneAssigned' && (
              <img
                src={assignedPhotoUrl}
                alt="Profile"
                className="template01-photo"
              />
            )}

            <h1 className="template01-name">
              {personalInfo?.fullName || 'Your Name'}
            </h1>

            {personalSummary?.summary && (
              <p className="template01-title">{personalSummary.summary}</p>
            )}

            {contactInfo && (
              <div className="template01-contact-grid">
                {contactInfo.email && (
                  <div className="">
                    <span className="template01-contact-icon">📧</span>
                    <span>{contactInfo.email}</span>
                  </div>
                )}
                {contactInfo.phone && (
                  <div className="">
                    <span className="template01-contact-icon">📞</span>
                    <span>{contactInfo.phone}</span>
                  </div>
                )}
                {(contactInfo.address ||
                  contactInfo.suburb ||
                  contactInfo.city) && (
                  <div className="template01-contact-item">
                    <span className="template01-contact-icon">📍</span>
                    <span>
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
                )}
              </div>
            )}
          </div>
        </header>

        <div className="template01-content">
          {/* Personal Information */}
          {personalInfo && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">👤</span>
                  Personal Information
                </h2>
              </div>
              <div className="template01-section-content">
                <div className="template01-personal-grid">
                  {personalInfo.dateOfBirth && (
                    <div className="template01-personal-item">
                      <span className="template01-personal-icon">📅</span>
                      <span className="template01-personal-label">
                        Date of Birth:
                      </span>
                      <span className="template01-personal-value">
                        {moment(personalInfo.dateOfBirth).format(
                          'MMMM D, YYYY'
                        )}
                      </span>
                    </div>
                  )}
                  {personalInfo.gender && (
                    <div className="template01-personal-item">
                      <span className="template01-personal-icon">👤</span>
                      <span className="template01-personal-label">Gender:</span>
                      <span className="template01-personal-value">
                        {personalInfo.gender}
                      </span>
                    </div>
                  )}
                  {personalInfo.nationality && (
                    <div className="template01-personal-item">
                      <span className="template01-personal-icon">🌍</span>
                      <span className="template01-personal-label">
                        Nationality:
                      </span>
                      <span className="template01-personal-value">
                        {personalInfo.nationality}
                      </span>
                    </div>
                  )}
                  {personalInfo.driversLicense && (
                    <div className="template01-personal-item">
                      <span className="template01-personal-icon">🚗</span>
                      <span className="template01-personal-label">
                        Driver's License:
                      </span>
                      <span className="template01-personal-value">
                        {personalInfo.licenseCode || 'Yes'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Personal Summary */}
          {personalSummary && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">📝</span>
                  Professional Summary
                </h2>
              </div>
              <div className="template01-section-content">
                <p className="template01-item-description">
                  {personalSummary.summary || personalSummary.content}
                </p>
              </div>
            </section>
          )}

          {/* Employment History */}
          {employHistorys && employHistorys.length > 0 && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">💼</span>
                  Employment History
                </h2>
              </div>
              <div className="template01-section-content">
                {employHistorys.map((history, index) => (
                  <div key={history._id || index} className="template01-item">
                    <div className="template01-item-header">
                      <div>
                        <h3 className="template01-item-title">
                          {history.position}
                        </h3>
                        <p className="template01-item-company">
                          {history.companyName}
                        </p>
                      </div>
                      <span className="template01-item-date">
                        {history.startDate} -{' '}
                        {history.current ? 'Present' : history.endDate}
                      </span>
                    </div>
                    {history.description && (
                      <p className="template01-item-description">
                        {history.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {experiences && experiences.length > 0 && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">⚡</span>
                  Work Experience
                </h2>
              </div>
              <div className="template01-section-content">
                {experiences.map((experience, index) => (
                  <div
                    key={experience._id || index}
                    className="template01-item"
                  >
                    <div className="template01-item-header">
                      <div>
                        <h3 className="template01-item-title">
                          {experience.title}
                        </h3>
                      </div>
                    </div>
                    {experience.description && (
                      <p className="template01-item-description">
                        {experience.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {(secondEdu && secondEdu.length > 0) ||
          (tertEdus && tertEdus.length > 0) ? (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">🎓</span>
                  Education
                </h2>
              </div>
              <div className="template01-section-content">
                {/* Tertiary Education */}
                {tertEdus && tertEdus.length > 0 && (
                  <>
                    <h4
                      style={{
                        marginBottom: '1rem',
                        color: 'var(--primary-color)',
                        fontWeight: '600',
                      }}
                    >
                      Tertiary Education
                    </h4>
                    {tertEdus.map((edu, index) => (
                      <div key={edu._id || index} className="template01-item">
                        <div className="template01-item-header">
                          <div>
                            <h3 className="template01-item-title">
                              {edu.certificationType}
                            </h3>
                            <p className="template01-item-company">
                              {edu.instituteName}
                            </p>
                          </div>
                          <span className="template01-item-date">
                            {formatDate(edu.startDate)} -{' '}
                            {formatDate(edu.endDate)}
                          </span>
                        </div>
                        {edu.description && (
                          <p className="template01-item-description">
                            {edu.description}
                          </p>
                        )}
                        {edu.additionalInfo && (
                          <p className="template01-item-description">
                            {edu.additionalInfo}
                          </p>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Secondary Education */}
                {secondEdu && secondEdu.length > 0 && (
                  <>
                    <h4
                      style={{
                        marginBottom: '1rem',
                        color: 'var(--primary-color)',
                        fontWeight: '600',
                      }}
                    >
                      Secondary Education
                    </h4>
                    {secondEdu.map((edu, index) => (
                      <div key={edu._id || index} className="template01-item">
                        <div className="template01-item-header">
                          <div>
                            <h3 className="template01-item-title">
                              {edu.schoolName}
                            </h3>
                          </div>
                          <span className="template01-item-date">
                            {formatDate(edu.startDate)} -{' '}
                            {formatDate(edu.endDate)}
                          </span>
                        </div>
                        {edu.subjects && edu.subjects.length > 0 && (
                          <p className="template01-item-description">
                            <strong>Subjects:</strong>{' '}
                            {renderSubjects(edu.subjects)}
                          </p>
                        )}
                        {edu.additionalInfo && (
                          <p className="template01-item-description">
                            {edu.additionalInfo}
                          </p>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>
          ) : null}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">🛠️</span>
                  Skills
                </h2>
              </div>
              <div className="template01-section-content">
                <div className="template01-skills-grid">
                  {skills.map((skill, index) => (
                    <div
                      key={skill._id || index}
                      className="template01-skill-item"
                    >
                      <span className="template01-skill-name">
                        {skill.skill}
                      </span>
                      {skill.proficiency &&
                        renderProficiency(skill.proficiency)}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">🌐</span>
                  Languages
                </h2>
              </div>
              <div className="template01-section-content">
                <div className="template01-languages-grid">
                  {languages.map((language, index) => (
                    <div
                      key={language._id || index}
                      className="template01-language-item"
                    >
                      <h4 className="template01-language-name">
                        {language.languageName}
                      </h4>
                      <div className="template01-language-skills">
                        {language.read && (
                          <div className="template01-language-skill">
                            <span className="template01-language-skill-label">
                              Reading
                            </span>
                            {renderProficiency(language.read)}
                          </div>
                        )}
                        {language.write && (
                          <div className="template01-language-skill">
                            <span className="template01-language-skill-label">
                              Writing
                            </span>
                            {renderProficiency(language.write)}
                          </div>
                        )}
                        {language.speak && (
                          <div className="template01-language-skill">
                            <span className="template01-language-skill-label">
                              Speaking
                            </span>
                            {renderProficiency(language.speak)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Interests */}
          {interests && interests.length > 0 && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">🎯</span>
                  Interests
                </h2>
              </div>
              <div className="template01-section-content">
                <div className="template01-interests">
                  {interests.map((interest, index) => (
                    <span
                      key={interest._id || index}
                      className="template01-interest-tag"
                    >
                      {interest.interest}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Attributes */}
          {attributes && attributes.length > 0 && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">✨</span>
                  Attributes
                </h2>
              </div>
              <div className="template01-section-content">
                <div className="template01-attributes">
                  {attributes.map((attribute, index) => (
                    <span
                      key={attribute._id || index}
                      className="template01-attribute-tag"
                    >
                      {attribute.attribute}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* References */}
          {references && references.length > 0 && (
            <section className="template01-section">
              <div className="template01-section-header">
                <h2 className="template01-section-title">
                  <span className="template01-section-icon">👥</span>
                  References
                </h2>
              </div>
              <div className="template01-section-content">
                <div className="template01-references-grid">
                  {references.map((reference, index) => (
                    <div
                      key={reference._id || index}
                      className="template01-reference-item"
                    >
                      <h4 className="template01-reference-name">
                        {reference.name}
                      </h4>
                      <p className="template01-reference-company">
                        {reference.company}
                      </p>
                      <div className="template01-reference-contact">
                        {reference.phone && (
                          <div className="template01-reference-contact-item">
                            <span>📞</span>
                            <span>{reference.phone}</span>
                          </div>
                        )}
                        {reference.email && (
                          <div className="template01-reference-contact-item">
                            <span>📧</span>
                            <span>{reference.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template01;
