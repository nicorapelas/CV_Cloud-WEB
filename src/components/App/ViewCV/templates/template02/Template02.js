import React from 'react';
import moment from 'moment';
import './template02.css';

const Template02 = ({ cvData }) => {
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
      <div className="template02-skill-level">
        {[...Array(filledDots)].map((_, i) => (
          <div key={`filled-${i}`} className="template02-skill-dot filled" />
        ))}
        {[...Array(emptyDots)].map((_, i) => (
          <div key={`empty-${i}`} className="template02-skill-dot" />
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
    <div className="template02-wrapper">
      <div className="template02-container">
        {/* Header Section */}
        <div className="template02-header">
          <div className="template02-header-content">
            <div className="template02-photo-section">
              {assignedPhotoUrl && (
                <img
                  src={assignedPhotoUrl}
                  alt="Profile"
                  className="template02-photo"
                />
              )}
            </div>
            <div className="template02-info-section">
              <h1 className="template02-name">
                {personalInfo?.fullName || 'Your Name'}
              </h1>
              <div className="template02-contact-grid">
                {contactInfo?.email && (
                  <div className="template02-contact-item">
                    <span className="template02-contact-icon">📧</span>
                    <span className="template02-contact-text">
                      {contactInfo.email}
                    </span>
                  </div>
                )}
                {contactInfo?.phone && (
                  <div className="template02-contact-item">
                    <span className="template02-contact-icon">📱</span>
                    <span className="template02-contact-text">
                      {contactInfo.phone}
                    </span>
                  </div>
                )}
                {contactInfo?.address && (
                  <div className="template02-contact-item">
                    <span className="template02-contact-icon">📍</span>
                    <span className="template02-contact-text">
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

        {/* Main Content */}
        <div className="template02-content">
          {/* Personal Summary */}
          {personalSummary?.content && (
            <div className="template02-section">
              <h2 className="template02-section-title">Professional Summary</h2>
              <div className="template02-section-content">
                <p className="template02-summary">{personalSummary.content}</p>
              </div>
            </div>
          )}

          {/* Work Experience */}
          {employHistorys && employHistorys.length > 0 && (
            <div className="template02-section">
              <h2 className="template02-section-title">Work Experience</h2>
              <div className="template02-section-content">
                {employHistorys.map((job, index) => (
                  <div key={index} className="template02-experience-item">
                    <div className="template02-experience-header">
                      <h3 className="template02-experience-title">
                        {job.position}
                      </h3>
                      <div className="template02-experience-company">
                        {job.company}
                      </div>
                      <div className="template02-experience-dates">
                        {formatDate(job.startDate)}
                        {job.endDate
                          ? ` - ${formatDate(job.endDate)}`
                          : ' - Present'}
                      </div>
                    </div>
                    {job.description && (
                      <div className="template02-experience-description">
                        {job.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {(tertEdus && tertEdus.length > 0) ||
          (secondEdu && secondEdu.length > 0) ? (
            <div className="template02-section">
              <h2 className="template02-section-title">Education</h2>
              <div className="template02-section-content">
                {/* Tertiary Education */}
                {tertEdus &&
                  tertEdus.map((edu, index) => (
                    <div
                      key={`tert-${index}`}
                      className="template02-education-item"
                    >
                      <div className="template02-education-header">
                        <h3 className="template02-education-title">
                          {edu.certificationType} - {edu.instituteName}
                        </h3>
                        <div className="template02-education-dates">
                          {formatDate(edu.startDate)} -{' '}
                          {formatDate(edu.endDate)}
                        </div>
                      </div>
                      {edu.description && (
                        <div className="template02-education-description">
                          {edu.description}
                        </div>
                      )}
                      {edu.additionalInfo && (
                        <div className="template02-education-additional">
                          {edu.additionalInfo}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Secondary Education */}
                {secondEdu &&
                  secondEdu.map((edu, index) => (
                    <div
                      key={`second-${index}`}
                      className="template02-education-item"
                    >
                      <div className="template02-education-header">
                        <h3 className="template02-education-title">
                          {edu.schoolName}
                        </h3>
                        <div className="template02-education-dates">
                          {formatDate(edu.startDate)} -{' '}
                          {formatDate(edu.endDate)}
                        </div>
                      </div>
                      {edu.subjects && edu.subjects.length > 0 && (
                        <div className="template02-education-subjects">
                          <strong>Subjects:</strong>{' '}
                          {renderSubjects(edu.subjects)}
                        </div>
                      )}
                      {edu.additionalInfo && (
                        <p className="template02-education-description">
                          {edu.additionalInfo}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : null}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="template02-section">
              <h2 className="template02-section-title">Skills</h2>
              <div className="template02-section-content">
                <div className="template02-skills-grid">
                  {skills.map((skill, index) => (
                    <div key={index} className="template02-skill-item">
                      <div className="template02-skill-name">{skill.skill}</div>
                      {renderProficiency(skill.proficiency)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="template02-section">
              <h2 className="template02-section-title">Languages</h2>
              <div className="template02-section-content">
                <div className="template02-languages-grid">
                  {languages.map((language, index) => (
                    <div key={index} className="template02-language-item">
                      <div className="template02-language-name">
                        {language.language}
                      </div>
                      <div className="template02-language-proficiency">
                        <span>Read: {renderProficiency(language.read)}</span>
                        <span>Write: {renderProficiency(language.write)}</span>
                        <span>Speak: {renderProficiency(language.speak)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience/Projects */}
          {experiences && experiences.length > 0 && (
            <div className="template02-section">
              <h2 className="template02-section-title">
                Additional Experience
              </h2>
              <div className="template02-section-content">
                {experiences.map((experience, index) => (
                  <div key={index} className="template02-experience-item">
                    <div className="template02-experience-header">
                      <h3 className="template02-experience-title">
                        {experience.title}
                      </h3>
                    </div>
                    {experience.description && (
                      <div className="template02-experience-description">
                        {experience.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {interests && interests.length > 0 && (
            <div className="template02-section">
              <h2 className="template02-section-title">Interests</h2>
              <div className="template02-section-content">
                <div className="template02-interests-list">
                  {interests.map((interest, index) => (
                    <span key={index} className="template02-interest-tag">
                      {interest.interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Attributes */}
          {attributes && attributes.length > 0 && (
            <div className="template02-section">
              <h2 className="template02-section-title">Attributes</h2>
              <div className="template02-section-content">
                <div className="template02-attributes-list">
                  {attributes.map((attribute, index) => (
                    <span key={index} className="template02-attribute-tag">
                      {attribute.attribute}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* References */}
          {references && references.length > 0 && (
            <div className="template02-section">
              <h2 className="template02-section-title">References</h2>
              <div className="template02-section-content">
                <div className="template02-references-grid">
                  {references.map((reference, index) => (
                    <div key={index} className="template02-reference-item">
                      <div className="template02-reference-name">
                        {reference.name}
                      </div>
                      <div className="template02-reference-company">
                        {reference.company}
                      </div>
                      <div className="template02-reference-contact">
                        {reference.email && (
                          <div className="template02-reference-email">
                            {reference.email}
                          </div>
                        )}
                        {reference.phone && (
                          <div className="template02-reference-phone">
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
    </div>
  );
};

export default Template02;
