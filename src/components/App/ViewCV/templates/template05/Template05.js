import React from 'react';
import moment from 'moment';
import './template05.css';

const Template05 = ({ cvData }) => {
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

  // Helper function to render subjects
  const renderSubjects = subjects => {
    if (!subjects || !Array.isArray(subjects)) return '';
    return subjects.map(subject => subject.subject || subject).join(', ');
  };

  // Helper function to render proficiency dots
  const renderProficiency = level => {
    const dots = [];
    const maxDots = 5;
    for (let i = 0; i < maxDots; i++) {
      dots.push(
        <span
          key={i}
          className={`template05-proficiency-dot ${
            i < level ? 'template05-proficiency-dot-filled' : ''
          }`}
        />
      );
    }
    return dots;
  };

  return (
    <div className="template05-wrapper">
      <div className="template05-container">
        {/* Header Section */}
        <div className="template05-header">
          <div className="template05-header-content">
            {assignedPhotoUrl && (
              <div className="template05-photo-container">
                <img
                  src={assignedPhotoUrl}
                  alt="Profile"
                  className="template05-photo"
                />
              </div>
            )}
            <div className="template05-header-info">
              <h1 className="template05-name">
                {personalInfo?.fullName || 'Your Name'}
              </h1>
              <div className="template05-contact">
                {contactInfo?.email && (
                  <div className="template05-contact-item">
                    <span className="template05-contact-icon">✉️</span>
                    <span>{contactInfo.email}</span>
                  </div>
                )}
                {contactInfo?.phone && (
                  <div className="template05-contact-item">
                    <span className="template05-contact-icon">📞</span>
                    <span>{contactInfo.phone}</span>
                  </div>
                )}
                {(contactInfo?.address ||
                  contactInfo?.suburb ||
                  contactInfo?.city) && (
                  <div className="template05-contact-item">
                    <span className="template05-contact-icon">📍</span>
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
            </div>
          </div>
        </div>

        {/* Personal Information */}
        {personalInfo && (
          <div className="template05-section">
            <div className="template05-section-header">
              <h3 className="template05-section-title">
                <span className="template05-section-icon">👤</span>
                Personal Information
              </h3>
            </div>
            <div className="template05-section-content">
              <div className="template05-personal-grid">
                {personalInfo.dateOfBirth && (
                  <div className="template05-personal-item">
                    <span className="template05-personal-icon">📅</span>
                    <span className="template05-personal-label">
                      Date of Birth:
                    </span>
                    <span className="template05-personal-value">
                      {moment(personalInfo.dateOfBirth).format('MMMM D, YYYY')}
                    </span>
                  </div>
                )}
                {personalInfo.gender && (
                  <div className="template05-personal-item">
                    <span className="template05-personal-icon">👤</span>
                    <span className="template05-personal-label">Gender:</span>
                    <span className="template05-personal-value">
                      {personalInfo.gender}
                    </span>
                  </div>
                )}
                {personalInfo.nationality && (
                  <div className="template05-personal-item">
                    <span className="template05-personal-icon">🌍</span>
                    <span className="template05-personal-label">
                      Nationality:
                    </span>
                    <span className="template05-personal-value">
                      {personalInfo.nationality}
                    </span>
                  </div>
                )}
                {personalInfo.driversLicense && (
                  <div className="template05-personal-item">
                    <span className="template05-personal-icon">🚗</span>
                    <span className="template05-personal-label">
                      Driver's License:
                    </span>
                    <span className="template05-personal-value">
                      {personalInfo.licenseCode || 'Yes'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="template05-main">
          {/* Left Sidebar */}
          <div className="template05-sidebar">
            {/* Personal Summary */}
            {personalSummary?.content && (
              <div className="template05-section">
                <h3 className="template05-section-title">About</h3>
                <p className="template05-summary">{personalSummary.content}</p>
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="template05-section">
                <h3 className="template05-section-title">Skills</h3>
                <div className="template05-skills">
                  {skills.map((skill, index) => (
                    <div key={index} className="template05-skill-item">
                      <span className="template05-skill-name">
                        {skill.skill}
                      </span>
                      <div className="template05-skill-level">
                        {renderProficiency(skill.level || 3)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div className="template05-section">
                <h3 className="template05-section-title">Languages</h3>
                <div className="template05-languages">
                  {languages.map((language, index) => (
                    <div key={index} className="template05-language-item">
                      <span className="template05-language-name">
                        {language.language}
                      </span>
                      <div className="template05-language-proficiency">
                        <div className="template05-proficiency-row">
                          <span>Read:</span>
                          {renderProficiency(language.read)}
                        </div>
                        <div className="template05-proficiency-row">
                          <span>Write:</span>
                          {renderProficiency(language.write)}
                        </div>
                        <div className="template05-proficiency-row">
                          <span>Speak:</span>
                          {renderProficiency(language.speak)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {attributes && attributes.length > 0 && (
              <div className="template05-section">
                <h3 className="template05-section-title">Attributes</h3>
                <div className="template05-attributes">
                  {attributes.map((attribute, index) => (
                    <div key={index} className="template05-attribute-item">
                      <span className="template05-attribute-bullet">•</span>
                      <span className="template05-attribute-text">
                        {attribute.attribute}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {interests && interests.length > 0 && (
              <div className="template05-section">
                <h3 className="template05-section-title">Interests</h3>
                <div className="template05-interests">
                  {interests.map((interest, index) => (
                    <span key={index} className="template05-interest-tag">
                      {interest.interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="template05-content">
            {/* Experience */}
            {employHistorys && employHistorys.length > 0 && (
              <div className="template05-section">
                <h3 className="template05-section-title">Experience</h3>
                <div className="template05-experience">
                  {employHistorys.map((job, index) => (
                    <div key={index} className="template05-experience-item">
                      <div className="template05-experience-header">
                        <h4 className="template05-experience-title">
                          {job.jobTitle}
                        </h4>
                        <div className="template05-experience-meta">
                          <span className="template05-company">
                            {job.companyName}
                          </span>
                          <span className="template05-dates">
                            {formatDate(job.startDate)} -{' '}
                            {job.endDate ? formatDate(job.endDate) : 'Present'}
                          </span>
                        </div>
                      </div>
                      {job.description && (
                        <p className="template05-experience-description">
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
              <div className="template05-section">
                <h3 className="template05-section-title">Education</h3>
                <div className="template05-education">
                  {/* Tertiary Education */}
                  {tertEdus &&
                    tertEdus.map((edu, index) => (
                      <div
                        key={`tert-${index}`}
                        className="template05-education-item"
                      >
                        <div className="template05-education-header">
                          <h4 className="template05-education-title">
                            {edu.certificationType} - {edu.instituteName}
                          </h4>
                          <span className="template05-education-dates">
                            {formatDate(edu.startDate)} -{' '}
                            {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                          </span>
                        </div>
                        {edu.description && (
                          <p className="template05-education-description">
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
                        className="template05-education-item"
                      >
                        <div className="template05-education-header">
                          <h4 className="template05-education-title">
                            {edu.schoolName}
                          </h4>
                          <span className="template05-education-dates">
                            {formatDate(edu.startDate)} -{' '}
                            {formatDate(edu.endDate)}
                          </span>
                        </div>
                        {edu.subjects && edu.subjects.length > 0 && (
                          <div className="template05-education-subjects">
                            <span className="template05-education-subjects-label">
                              Subjects:{' '}
                            </span>
                            <span className="template05-subject">
                              {renderSubjects(edu.subjects)}
                            </span>
                          </div>
                        )}
                        {edu.additionalInfo && (
                          <p className="template05-education-description">
                            {edu.additionalInfo}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* References */}
            {references && references.length > 0 && (
              <div className="template05-section">
                <h3 className="template05-section-title">References</h3>
                <div className="template05-references">
                  {references.map((reference, index) => (
                    <div key={index} className="template05-reference-item">
                      <h4 className="template05-reference-name">
                        {reference.name}
                      </h4>
                      <p className="template05-reference-title">
                        {reference.title}
                      </p>
                      <p className="template05-reference-company">
                        {reference.company}
                      </p>
                      {reference.phone && (
                        <p className="template05-reference-contact">
                          📞 {reference.phone}
                        </p>
                      )}
                      {reference.email && (
                        <p className="template05-reference-contact">
                          ✉️ {reference.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template05;
