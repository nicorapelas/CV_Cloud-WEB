import React from 'react';
import moment from 'moment';
import './template03.css';

const Template03 = ({ cvData }) => {
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
      <div className="template03-skill-level">
        {[...Array(filledDots)].map((_, i) => (
          <div key={`filled-${i}`} className="template03-skill-dot filled" />
        ))}
        {[...Array(emptyDots)].map((_, i) => (
          <div key={`empty-${i}`} className="template03-skill-dot" />
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
    <div className="template03-wrapper">
      <div className="template03-container">
        {/* Creative Header Section */}
        <div className="template03-header">
          <div className="template03-header-main">
            <div className="template03-name-section">
              <h1 className="template03-name">
                {personalInfo?.fullName || 'Your Name'}
              </h1>
              <div className="template03-title">Professional CV</div>
            </div>
            <div className="template03-photo-section">
              {assignedPhotoUrl && (
                <img
                  src={assignedPhotoUrl}
                  alt="Profile"
                  className="template03-photo"
                />
              )}
            </div>
          </div>
          <div className="template03-contact-sidebar">
            <div className="template03-contact-item">
              <span className="template03-contact-icon">📧</span>
              <span className="template03-contact-text">
                {contactInfo?.email || 'email@example.com'}
              </span>
            </div>
            <div className="template03-contact-item">
              <span className="template03-contact-icon">📱</span>
              <span className="template03-contact-text">
                {contactInfo?.phone || '+1 234 567 8900'}
              </span>
            </div>
            <div className="template03-contact-item">
              <span className="template03-contact-icon">📍</span>
              <span className="template03-contact-text">
                {contactInfo?.address && `${contactInfo.address}, `}
                {contactInfo?.city && `${contactInfo.city}, `}
                {contactInfo?.country || 'Your Location'}
              </span>
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        {personalSummary?.content && (
          <div className="template03-summary-section">
            <div className="template03-section-header">
              <span className="template03-section-icon">💼</span>
              <h2 className="template03-section-title">Professional Summary</h2>
            </div>
            <div className="template03-summary-content">
              <p>{personalSummary.content}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="template03-main-content">
          {/* Left Column */}
          <div className="template03-left-column">
            {/* Work Experience */}
            {employHistorys && employHistorys.length > 0 && (
              <div className="template03-section">
                <div className="template03-section-header">
                  <span className="template03-section-icon">💼</span>
                  <h2 className="template03-section-title">Work Experience</h2>
                </div>
                <div className="template03-section-content">
                  {employHistorys.map((job, index) => (
                    <div key={index} className="template03-experience-item">
                      <div className="template03-experience-header">
                        <h3 className="template03-experience-title">
                          {job.position}
                        </h3>
                        <div className="template03-experience-company">
                          {job.company}
                        </div>
                        <div className="template03-experience-dates">
                          {formatDate(job.startDate)}
                          {job.endDate
                            ? ` - ${formatDate(job.endDate)}`
                            : ' - Present'}
                        </div>
                      </div>
                      {job.description && (
                        <div className="template03-experience-description">
                          {job.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {((tertEdus && tertEdus.length > 0) ||
              (secondEdu && secondEdu.length > 0)) && (
              <div className="template03-section">
                <div className="template03-section-header">
                  <span className="template03-section-icon">🎓</span>
                  <h2 className="template03-section-title">Education</h2>
                </div>
                <div className="template03-section-content">
                  {/* Tertiary Education */}
                  {tertEdus &&
                    tertEdus.map((edu, index) => (
                      <div
                        key={`tert-${index}`}
                        className="template03-education-item"
                      >
                        <div className="template03-education-header">
                          <h3 className="template03-education-title">
                            {edu.certificationType} - {edu.instituteName}
                          </h3>
                          <div className="template03-education-dates">
                            {formatDate(edu.startDate)} -{' '}
                            {formatDate(edu.endDate)}
                          </div>
                        </div>
                        {edu.description && (
                          <div className="template03-education-description">
                            {edu.description}
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Secondary Education */}
                  {secondEdu &&
                    secondEdu.map((edu, index) => (
                      <div
                        key={`second-${index}`}
                        className="template03-education-item"
                      >
                        <div className="template03-education-header">
                          <h3 className="template03-education-title">
                            {edu.schoolName}
                          </h3>
                          <div className="template03-education-dates">
                            {formatDate(edu.startDate)} -{' '}
                            {formatDate(edu.endDate)}
                          </div>
                        </div>
                        {edu.subjects && edu.subjects.length > 0 && (
                          <div className="template03-education-subjects">
                            <strong>Subjects:</strong>{' '}
                            {renderSubjects(edu.subjects)}
                          </div>
                        )}
                        {edu.additionalInfo && (
                          <p className="template03-education-description">
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
          <div className="template03-right-column">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="template03-section">
                <div className="template03-section-header">
                  <span className="template03-section-icon">⚡</span>
                  <h2 className="template03-section-title">Skills</h2>
                </div>
                <div className="template03-section-content">
                  <div className="template03-skills-grid">
                    {skills.map((skill, index) => (
                      <div key={index} className="template03-skill-item">
                        <div className="template03-skill-name">
                          {skill.skill}
                        </div>
                        {renderProficiency(skill.proficiency)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div className="template03-section">
                <div className="template03-section-header">
                  <span className="template03-section-icon">🌍</span>
                  <h2 className="template03-section-title">Languages</h2>
                </div>
                <div className="template03-section-content">
                  <div className="template03-languages-list">
                    {languages.map((language, index) => (
                      <div key={index} className="template03-language-item">
                        <div className="template03-language-name">
                          {language.language}
                        </div>
                        <div className="template03-language-proficiency">
                          <span>Read: {renderProficiency(language.read)}</span>
                          <span>
                            Write: {renderProficiency(language.write)}
                          </span>
                          <span>
                            Speak: {renderProficiency(language.speak)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* References */}
            {references && references.length > 0 && (
              <div className="template03-section">
                <div className="template03-section-header">
                  <span className="template03-section-icon">👥</span>
                  <h2 className="template03-section-title">References</h2>
                </div>
                <div className="template03-section-content">
                  <div className="template03-references-list">
                    {references.map((reference, index) => (
                      <div key={index} className="template03-reference-item">
                        <div className="template03-reference-name">
                          {reference.name}
                        </div>
                        <div className="template03-reference-company">
                          {reference.company}
                        </div>
                        <div className="template03-reference-contact">
                          {reference.email && (
                            <div className="template03-reference-email">
                              {reference.email}
                            </div>
                          )}
                          {reference.phone && (
                            <div className="template03-reference-phone">
                              {reference.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="template03-bottom-section">
          {/* Experience/Projects */}
          {experiences && experiences.length > 0 && (
            <div className="template03-section">
              <div className="template03-section-header">
                <span className="template03-section-icon">🚀</span>
                <h2 className="template03-section-title">
                  Additional Experience
                </h2>
              </div>
              <div className="template03-section-content">
                <div className="template03-experiences-grid">
                  {experiences.map((experience, index) => (
                    <div key={index} className="template03-experience-card">
                      <h3 className="template03-experience-card-title">
                        {experience.title}
                      </h3>
                      {experience.description && (
                        <div className="template03-experience-card-description">
                          {experience.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interests */}
          {interests && interests.length > 0 && (
            <div className="template03-section">
              <div className="template03-section-header">
                <span className="template03-section-icon">🎯</span>
                <h2 className="template03-section-title">Interests</h2>
              </div>
              <div className="template03-section-content">
                <div className="template03-interests-list">
                  {interests.map((interest, index) => (
                    <span key={index} className="template03-interest-tag">
                      {interest.interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Attributes */}
          {attributes && attributes.length > 0 && (
            <div className="template03-section">
              <div className="template03-section-header">
                <span className="template03-section-icon">✨</span>
                <h2 className="template03-section-title">Attributes</h2>
              </div>
              <div className="template03-section-content">
                <div className="template03-attributes-list">
                  {attributes.map((attribute, index) => (
                    <span key={index} className="template03-attribute-tag">
                      {attribute.attribute}
                    </span>
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

export default Template03;
