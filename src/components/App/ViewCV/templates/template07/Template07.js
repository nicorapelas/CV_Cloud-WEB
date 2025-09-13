import React from 'react';
import moment from 'moment';
import './template07.css';

const Template07 = ({ cvData }) => {
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
      <div className="template07-proficiency-container">
        <div className="template07-proficiency-bar">
          <div
            className="template07-proficiency-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="template07-proficiency-text">{level}/5</span>
      </div>
    );
  };

  // Helper function to render subjects array
  const renderSubjects = subjects => {
    if (!subjects || subjects.length === 0) return null;
    return subjects.map((subject, index) => (
      <span key={subject._id || index} className="template07-subject-tag">
        {subject.subject}
      </span>
    ));
  };

  return (
    <div className="template07-finance">
      {/* Header Section */}
      <header className="template07-header">
        <div className="template07-header-content">
          <div className="template07-header-left">
            <h1 className="template07-name">
              {personalInfo?.fullName || 'Professional Name'}
            </h1>
            <div className="template07-title">
              {personalSummary?.content?.split('.')[0] ||
                'Financial Professional'}
            </div>
            <div className="template07-header-contact">
              {contactInfo?.email && (
                <div className="template07-contact-item">
                  <span className="template07-contact-icon">✉</span>
                  {contactInfo.email}
                </div>
              )}
              {contactInfo?.phone && (
                <div className="template07-contact-item">
                  <span className="template07-contact-icon">📞</span>
                  {contactInfo.phone}
                </div>
              )}
              {(contactInfo?.address || contactInfo?.city) && (
                <div className="template07-contact-item">
                  <span className="template07-contact-icon">📍</span>
                  {[
                    contactInfo.address,
                    contactInfo.suburb,
                    contactInfo.city,
                    contactInfo.province,
                    contactInfo.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </div>
          </div>
          {assignedPhotoUrl && (
            <div className="template07-header-right">
              <img
                src={assignedPhotoUrl}
                alt="Profile"
                className="template07-profile-photo"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="template07-main">
        <div className="template07-content">
          {/* Left Column */}
          <div className="template07-left-column">
            {/* Professional Summary */}
            {personalSummary && (
              <section className="template07-section">
                <h2 className="template07-section-title">
                  PROFESSIONAL SUMMARY
                </h2>
                <div className="template07-summary-content">
                  {personalSummary.content}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {experiences && experiences.length > 0 && (
              <section className="template07-section">
                <h2 className="template07-section-title">
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className="template07-experiences">
                  {experiences.map((experience, index) => (
                    <div
                      key={experience._id || index}
                      className="template07-experience-item"
                    >
                      <h3 className="template07-experience-title">
                        {experience.title}
                      </h3>
                      <div className="template07-experience-description">
                        {experience.description}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Employment History */}
            {employHistorys && employHistorys.length > 0 && (
              <section className="template07-section">
                <h2 className="template07-section-title">EMPLOYMENT HISTORY</h2>
                <div className="template07-employment-list">
                  {employHistorys.map((job, index) => (
                    <div
                      key={job._id || index}
                      className="template07-employment-item"
                    >
                      <div className="template07-employment-header">
                        <div className="template07-employment-title-section">
                          <h3 className="template07-employment-title">
                            {job.position}
                          </h3>
                          <div className="template07-employment-company">
                            {job.company}
                          </div>
                        </div>
                        <div className="template07-employment-dates">
                          {formatDate(job.startDate)} -{' '}
                          {job.current ? 'Present' : formatDate(job.endDate)}
                        </div>
                      </div>
                      {job.description && (
                        <div className="template07-employment-description">
                          {job.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            <section className="template07-section">
              <h2 className="template07-section-title">EDUCATION</h2>

              {/* Tertiary Education */}
              {tertEdus && tertEdus.length > 0 && (
                <div className="template07-education-section">
                  {tertEdus.map((edu, index) => (
                    <div
                      key={edu._id || index}
                      className="template07-education-item"
                    >
                      <div className="template07-education-header">
                        <div className="template07-education-title-section">
                          <h3 className="template07-education-title">
                            {edu.instituteName}
                          </h3>
                          <div className="template07-education-type">
                            {edu.certificationType}
                          </div>
                        </div>
                        <div className="template07-education-dates">
                          {formatDate(edu.startDate)} -{' '}
                          {formatDate(edu.endDate)}
                        </div>
                      </div>
                      {edu.description && (
                        <div className="template07-education-description">
                          {edu.description}
                        </div>
                      )}
                      {edu.additionalInfo && (
                        <div className="template07-education-additional">
                          {edu.additionalInfo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Secondary Education */}
              {secondEdu && secondEdu.length > 0 && (
                <div className="template07-education-section">
                  {secondEdu.map((edu, index) => (
                    <div
                      key={edu._id || index}
                      className="template07-education-item"
                    >
                      <div className="template07-education-header">
                        <div className="template07-education-title-section">
                          <h3 className="template07-education-title">
                            {edu.schoolName}
                          </h3>
                        </div>
                        <div className="template07-education-dates">
                          {formatDate(edu.startDate)} -{' '}
                          {formatDate(edu.endDate)}
                        </div>
                      </div>
                      {edu.subjects && edu.subjects.length > 0 && (
                        <div className="template07-education-subjects">
                          <strong>Key Subjects:</strong>
                          <div className="template07-subjects-container">
                            {renderSubjects(edu.subjects)}
                          </div>
                        </div>
                      )}
                      {edu.additionalInfo && (
                        <div className="template07-education-additional">
                          {edu.additionalInfo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="template07-right-column">
            {/* Personal Information */}
            {personalInfo && (
              <section className="template07-section">
                <h2 className="template07-section-title">PERSONAL DETAILS</h2>
                <div className="template07-personal-info">
                  {personalInfo.dateOfBirth && (
                    <div className="template07-personal-item">
                      <span className="template07-personal-label">
                        Date of Birth:
                      </span>
                      <span className="template07-personal-value">
                        {formatDate(personalInfo.dateOfBirth)}
                      </span>
                    </div>
                  )}
                  {personalInfo.gender && (
                    <div className="template07-personal-item">
                      <span className="template07-personal-label">Gender:</span>
                      <span className="template07-personal-value">
                        {personalInfo.gender}
                      </span>
                    </div>
                  )}
                  {personalInfo.nationality && (
                    <div className="template07-personal-item">
                      <span className="template07-personal-label">
                        Nationality:
                      </span>
                      <span className="template07-personal-value">
                        {personalInfo.nationality}
                      </span>
                    </div>
                  )}
                  {personalInfo.driversLicense && (
                    <div className="template07-personal-item">
                      <span className="template07-personal-label">
                        Driver's License:
                      </span>
                      <span className="template07-personal-value">
                        {personalInfo.licenseCode || 'Valid'}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Core Competencies */}
            {skills && skills.length > 0 && (
              <section className="template07-section">
                <h2 className="template07-section-title">CORE COMPETENCIES</h2>
                <div className="template07-skills">
                  {skills.map((skill, index) => (
                    <div
                      key={skill._id || index}
                      className="template07-skill-item"
                    >
                      <div className="template07-skill-name">{skill.skill}</div>
                      {renderProficiency(skill.proficiency)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <section className="template07-section">
                <h2 className="template07-section-title">LANGUAGES</h2>
                <div className="template07-languages">
                  {languages.map((language, index) => (
                    <div
                      key={language._id || index}
                      className="template07-language-item"
                    >
                      <div className="template07-language-name">
                        {language.language}
                      </div>
                      <div className="template07-language-proficiency">
                        <div className="template07-language-skill">
                          <span>Read:</span> {renderProficiency(language.read)}
                        </div>
                        <div className="template07-language-skill">
                          <span>Write:</span>{' '}
                          {renderProficiency(language.write)}
                        </div>
                        <div className="template07-language-skill">
                          <span>Speak:</span>{' '}
                          {renderProficiency(language.speak)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Professional Attributes */}
            {attributes && attributes.length > 0 && (
              <section className="template07-section">
                <h2 className="template07-section-title">
                  PROFESSIONAL ATTRIBUTES
                </h2>
                <div className="template07-attributes">
                  {attributes.map((attribute, index) => (
                    <div
                      key={attribute._id || index}
                      className="template07-attribute-item"
                    >
                      {attribute.attribute}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Interests */}
            {interests && interests.length > 0 && (
              <section className="template07-section">
                <h2 className="template07-section-title">INTERESTS</h2>
                <div className="template07-interests">
                  {interests.map((interest, index) => (
                    <div
                      key={interest._id || index}
                      className="template07-interest-item"
                    >
                      {interest.interest}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* References */}
            {references && references.length > 0 && (
              <section className="template07-section">
                <h2 className="template07-section-title">REFERENCES</h2>
                <div className="template07-references">
                  {references.map((reference, index) => (
                    <div
                      key={reference._id || index}
                      className="template07-reference-item"
                    >
                      <div className="template07-reference-name">
                        {reference.name}
                      </div>
                      <div className="template07-reference-company">
                        {reference.company}
                      </div>
                      <div className="template07-reference-contact">
                        {reference.email && (
                          <div className="template07-reference-email">
                            {reference.email}
                          </div>
                        )}
                        {reference.phone && (
                          <div className="template07-reference-phone">
                            {reference.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Template07;
