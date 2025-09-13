import React from 'react';
import moment from 'moment';
import './template04.css';

const Template04 = ({ cvData }) => {
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

    // Handle "Month YYYY" format specifically
    if (
      typeof dateString === 'string' &&
      /^[A-Za-z]+ \d{4}$/.test(dateString)
    ) {
      const [month, year] = dateString.split(' ');
      const monthIndex = moment().month(month).format('M') - 1;
      return moment([parseInt(year), monthIndex]).format('MMM YYYY');
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if can't parse
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch (error) {
      return dateString; // Return original if error
    }
  };

  // Helper function to render proficiency dots
  const renderProficiency = level => {
    const maxLevel = 5;
    const filledDots = Math.min(level, maxLevel);
    const emptyDots = maxLevel - filledDots;

    return (
      <div className="template04-skill-level">
        {[...Array(filledDots)].map((_, i) => (
          <div key={`filled-${i}`} className="template04-skill-dot filled" />
        ))}
        {[...Array(emptyDots)].map((_, i) => (
          <div key={`empty-${i}`} className="template04-skill-dot" />
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
    <div className="template04-wrapper">
      <div className="template04-container">
        {/* Header Section */}
        <div className="template04-header">
          <div className="template04-header-content">
            <div className="template04-photo-section">
              {assignedPhotoUrl && assignedPhotoUrl !== 'noneAssigned' && (
                <img
                  src={assignedPhotoUrl}
                  alt="Profile"
                  className="template04-photo"
                />
              )}
            </div>
            <div className="template04-info-section">
              <h1 className="template04-name">
                {personalInfo?.fullName || 'Your Name'}
              </h1>
              <p className="template04-title">Professional CV</p>
              <div className="template04-contact-grid">
                {contactInfo?.email && (
                  <div className="template04-contact-item">
                    <span className="template04-contact-icon">✉</span>
                    <span className="template04-contact-text">
                      {contactInfo.email}
                    </span>
                  </div>
                )}
                {contactInfo?.phone && (
                  <div className="template04-contact-item">
                    <span className="template04-contact-icon">📱</span>
                    <span className="template04-contact-text">
                      {contactInfo.phone}
                    </span>
                  </div>
                )}
                {contactInfo?.address && (
                  <div className="template04-contact-item">
                    <span className="template04-contact-icon">📍</span>
                    <span className="template04-contact-text">
                      {contactInfo.address}
                      {contactInfo.unit && `, ${contactInfo.unit}`}
                      {contactInfo.suburb && `, ${contactInfo.suburb}`}
                      {contactInfo.city && `, ${contactInfo.city}`}
                      {contactInfo.province && `, ${contactInfo.province}`}
                      {contactInfo.postalCode && `, ${contactInfo.postalCode}`}
                      {contactInfo.country && `, ${contactInfo.country}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="template04-main-content">
          {/* Left Column */}
          <div className="template04-left-column">
            {/* Professional Summary */}
            {personalSummary?.content && (
              <div className="template04-section">
                <div className="template04-section-header">
                  <span className="template04-section-icon">💼</span>
                  <h2 className="template04-section-title">Summary</h2>
                </div>
                <div className="template04-section-content">
                  <p className="template04-summary-text">
                    {personalSummary.content}
                  </p>
                </div>
              </div>
            )}

            {/* Work Experience */}
            {employHistorys && employHistorys.length > 0 && (
              <div className="template04-section">
                <div className="template04-section-header">
                  <span className="template04-section-icon">💼</span>
                  <h2 className="template04-section-title">Experience</h2>
                </div>
                <div className="template04-section-content">
                  {employHistorys.map((job, index) => (
                    <div key={index} className="template04-experience-item">
                      <div className="template04-experience-header">
                        <h3 className="template04-experience-title">
                          {job.position}
                        </h3>
                        <p className="template04-experience-company">
                          {job.company}
                        </p>
                        <span className="template04-experience-dates">
                          {formatDate(job.startDate)}
                          {job.endDate
                            ? ` - ${formatDate(job.endDate)}`
                            : ' - Present'}
                        </span>
                      </div>
                      {job.description && (
                        <p className="template04-experience-description">
                          {job.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {((tertEdus && tertEdus.length > 0) ||
              (secondEdu && secondEdu.length > 0)) && (
              <div className="template04-section">
                <div className="template04-section-header">
                  <span className="template04-section-icon">🎓</span>
                  <h2 className="template04-section-title">Education</h2>
                </div>
                <div className="template04-section-content">
                  {/* Tertiary Education */}
                  {tertEdus &&
                    tertEdus.map((edu, index) => (
                      <div
                        key={`tert-${index}`}
                        className="template04-education-item"
                      >
                        <div className="template04-education-header">
                          <h3 className="template04-education-title">
                            {edu.certificationType} - {edu.instituteName}
                          </h3>
                          <span className="template04-education-dates">
                            {formatDate(edu.startDate)} -{' '}
                            {formatDate(edu.endDate)}
                          </span>
                        </div>
                        {edu.description && (
                          <p className="template04-education-description">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}

                  {/* Secondary Education */}
                  {secondEdu &&
                    secondEdu.map((edu, index) => (
                      <div
                        key={`second-${index}`}
                        className="template04-education-item"
                      >
                        <div className="template04-education-header">
                          <h3 className="template04-education-title">
                            {edu.schoolName}
                          </h3>
                          <span className="template04-education-dates">
                            {formatDate(edu.startDate)} -{' '}
                            {formatDate(edu.endDate)}
                          </span>
                        </div>
                        {edu.subjects && edu.subjects.length > 0 && (
                          <div className="template04-education-subjects">
                            <span className="template04-education-subjects-label">
                              Subjects:{' '}
                            </span>
                            <span className="template04-subject">
                              {renderSubjects(edu.subjects)}
                            </span>
                          </div>
                        )}
                        {edu.additionalInfo && (
                          <p className="template04-education-description">
                            {edu.additionalInfo}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="template04-right-column">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="template04-section">
                <div className="template04-section-header">
                  <span className="template04-section-icon">⚡</span>
                  <h2 className="template04-section-title">Skills</h2>
                </div>
                <div className="template04-section-content">
                  <div className="template04-skills-grid">
                    {skills.map((skill, index) => (
                      <div key={index} className="template04-skill-item">
                        <span className="template04-skill-name">
                          {skill.skill}
                        </span>
                        {renderProficiency(skill.proficiency)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div className="template04-section">
                <div className="template04-section-header">
                  <span className="template04-section-icon">🌍</span>
                  <h2 className="template04-section-title">Languages</h2>
                </div>
                <div className="template04-section-content">
                  <div className="template04-languages-list">
                    {languages.map((language, index) => (
                      <div key={index} className="template04-language-item">
                        <h3 className="template04-language-name">
                          {language.language}
                        </h3>
                        <div className="template04-language-proficiency">
                          <div className="template04-language-proficiency-item">
                            <span className="template04-language-proficiency-label">
                              Read:{' '}
                            </span>
                            {renderProficiency(language.read)}
                          </div>
                          <div className="template04-language-proficiency-item">
                            <span className="template04-language-proficiency-label">
                              Write:{' '}
                            </span>
                            {renderProficiency(language.write)}
                          </div>
                          <div className="template04-language-proficiency-item">
                            <span className="template04-language-proficiency-label">
                              Speak:{' '}
                            </span>
                            {renderProficiency(language.speak)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* References */}
            {references && references.length > 0 && (
              <div className="template04-section">
                <div className="template04-section-header">
                  <span className="template04-section-icon">👥</span>
                  <h2 className="template04-section-title">References</h2>
                </div>
                <div className="template04-section-content">
                  <div className="template04-references-list">
                    {references.map((reference, index) => (
                      <div key={index} className="template04-reference-item">
                        <h3 className="template04-reference-name">
                          {reference.name}
                        </h3>
                        <p className="template04-reference-company">
                          {reference.company}
                        </p>
                        <div className="template04-reference-contact">
                          {reference.email && (
                            <span className="template04-reference-email">
                              {reference.email}
                            </span>
                          )}
                          {reference.phone && (
                            <span className="template04-reference-phone">
                              {reference.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Interests */}
            {interests && interests.length > 0 && (
              <div className="template04-section">
                <div className="template04-section-header">
                  <span className="template04-section-icon">🎯</span>
                  <h2 className="template04-section-title">Interests</h2>
                </div>
                <div className="template04-section-content">
                  <div className="template04-interests-list">
                    {interests.map((interest, index) => (
                      <div key={index} className="template04-interest-tag">
                        <span className="template04-interest-tag-text">
                          {interest.interest}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attributes */}
            {attributes && attributes.length > 0 && (
              <div className="template04-section">
                <div className="template04-section-header">
                  <span className="template04-section-icon">✨</span>
                  <h2 className="template04-section-title">Attributes</h2>
                </div>
                <div className="template04-section-content">
                  <div className="template04-attributes-list">
                    {attributes.map((attribute, index) => (
                      <div key={index} className="template04-attribute-tag">
                        <span className="template04-attribute-tag-text">
                          {attribute.attribute}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="template04-bottom-section">
          {/* Experience/Projects */}
          {experiences && experiences.length > 0 && (
            <div className="template04-section">
              <div className="template04-section-header">
                <span className="template04-section-icon">🚀</span>
                <h2 className="template04-section-title">Projects</h2>
              </div>
              <div className="template04-section-content">
                <div className="template04-experiences-grid">
                  {experiences.map((experience, index) => (
                    <div key={index} className="template04-experience-card">
                      <h3 className="template04-experience-card-title">
                        {experience.title}
                      </h3>
                      {experience.description && (
                        <p className="template04-experience-card-description">
                          {experience.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template04;
