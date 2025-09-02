import React from 'react';
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

  // Helper function to render proficiency stars
  const renderProficiency = level => {
    const maxLevel = 5;
    const filledStars = Math.min(level, maxLevel);
    const emptyStars = maxLevel - filledStars;

    return (
      <span className="proficiency-stars">
        {[...Array(filledStars)].map((_, i) => (
          <span key={`filled-${i}`} className="star filled">
            ★
          </span>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">
            ☆
          </span>
        ))}
      </span>
    );
  };

  // Helper function to render subjects array
  const renderSubjects = subjects => {
    if (!subjects || !Array.isArray(subjects)) return '';
    return subjects.map(subject => subject.subject || subject).join(', ');
  };

  return (
    <div className="cv-template-01">
      {/* Header Section */}
      <header className="cv-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="cv-name">{personalInfo?.fullName || 'Your Name'}</h1>
            {personalSummary?.summary && (
              <p className="cv-summary">{personalSummary.summary}</p>
            )}
          </div>
          {assignedPhotoUrl && assignedPhotoUrl !== 'noneAssigned' && (
            <div className="cv-photo">
              <img src={assignedPhotoUrl} alt="Profile Photo" />
            </div>
          )}
        </div>

        {contactInfo && (
          <div className="contact-info">
            {contactInfo.email && (
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>{contactInfo.email}</span>
              </div>
            )}
            {contactInfo.phone && (
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>{contactInfo.phone}</span>
              </div>
            )}
            {contactInfo.address && (
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>
                  {[
                    contactInfo.unit,
                    contactInfo.complex,
                    contactInfo.address,
                    contactInfo.suburb,
                    contactInfo.city,
                    contactInfo.province,
                    contactInfo.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="cv-content">
        {/* Personal Information */}
        {personalInfo && (
          <section className="cv-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="section-content">
              <div className="info-grid">
                {personalInfo.dateOfBirth && (
                  <div className="info-item">
                    <strong>Date of Birth:</strong> {personalInfo.dateOfBirth}
                  </div>
                )}
                {personalInfo.gender && (
                  <div className="info-item">
                    <strong>Gender:</strong> {personalInfo.gender}
                  </div>
                )}
                {personalInfo.nationality && (
                  <div className="info-item">
                    <strong>Nationality:</strong> {personalInfo.nationality}
                  </div>
                )}
                {personalInfo.driversLicense && (
                  <div className="info-item">
                    <strong>Driver's License:</strong>{' '}
                    {personalInfo.licenseCode || 'Yes'}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <section className="cv-section">
            <h2 className="section-title">Work Experience</h2>
            <div className="section-content">
              {experiences.map((experience, index) => (
                <div key={experience._id || index} className="experience-item">
                  <div className="experience-header">
                    <h3 className="experience-title">{experience.title}</h3>
                    <span className="experience-date">
                      {formatDate(experience.startDate)} -{' '}
                      {experience.endDate
                        ? formatDate(experience.endDate)
                        : 'Present'}
                    </span>
                  </div>
                  {experience.description && (
                    <p className="experience-description">
                      {experience.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Employment History */}
        {employHistorys && employHistorys.length > 0 && (
          <section className="cv-section">
            <h2 className="section-title">Employment History</h2>
            <div className="section-content">
              {employHistorys.map((history, index) => (
                <div key={history._id || index} className="employment-item">
                  <div className="employment-header">
                    <h3 className="employment-title">{history.position}</h3>
                    <span className="employment-company">
                      {history.companyName}
                    </span>
                    <span className="employment-date">
                      {formatDate(history.startDate)} -{' '}
                      {history.currentlyEmployed
                        ? 'Present'
                        : formatDate(history.endDate)}
                    </span>
                  </div>
                  {history.description && (
                    <p className="employment-description">
                      {history.description}
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
          <section className="cv-section">
            <h2 className="section-title">Education</h2>
            <div className="section-content">
              {/* Tertiary Education */}
              {tertEdus && tertEdus.length > 0 && (
                <div className="education-group">
                  <h3 className="education-subtitle">Tertiary Education</h3>
                  {tertEdus.map((edu, index) => (
                    <div key={edu._id || index} className="education-item">
                      <div className="education-header">
                        <h4 className="education-title">
                          {edu.certificationType}
                        </h4>
                        <span className="education-institute">
                          {edu.instituteName}
                        </span>
                        <span className="education-date">
                          {formatDate(edu.startDate)} -{' '}
                          {formatDate(edu.endDate)}
                        </span>
                      </div>
                      {edu.description && (
                        <p className="education-description">
                          {edu.description}
                        </p>
                      )}
                      {edu.additionalInfo && (
                        <p className="education-additional">
                          {edu.additionalInfo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Secondary Education */}
              {secondEdu && secondEdu.length > 0 && (
                <div className="education-group">
                  <h3 className="education-subtitle">Secondary Education</h3>
                  {secondEdu.map((edu, index) => (
                    <div key={edu._id || index} className="education-item">
                      <div className="education-header">
                        <h4 className="education-title">{edu.schoolName}</h4>
                        <span className="education-date">
                          {formatDate(edu.startDate)} -{' '}
                          {formatDate(edu.endDate)}
                        </span>
                      </div>
                      {edu.subjects && edu.subjects.length > 0 && (
                        <p className="education-subjects">
                          <strong>Subjects:</strong>{' '}
                          {renderSubjects(edu.subjects)}
                        </p>
                      )}
                      {edu.additionalInfo && (
                        <p className="education-additional">
                          {edu.additionalInfo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="cv-section">
            <h2 className="section-title">Skills</h2>
            <div className="section-content">
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <div key={skill._id || index} className="skill-item">
                    <span className="skill-name">{skill.skillName}</span>
                    {skill.proficiency && (
                      <span className="skill-proficiency">
                        {renderProficiency(skill.proficiency)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section className="cv-section">
            <h2 className="section-title">Languages</h2>
            <div className="section-content">
              <div className="languages-grid">
                {languages.map((language, index) => (
                  <div key={language._id || index} className="language-item">
                    <span className="language-name">
                      {language.languageName}
                    </span>
                    <div className="language-proficiencies">
                      {language.read && (
                        <div className="proficiency-item">
                          <span>Read:</span> {renderProficiency(language.read)}
                        </div>
                      )}
                      {language.write && (
                        <div className="proficiency-item">
                          <span>Write:</span>{' '}
                          {renderProficiency(language.write)}
                        </div>
                      )}
                      {language.speak && (
                        <div className="proficiency-item">
                          <span>Speak:</span>{' '}
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
          <section className="cv-section">
            <h2 className="section-title">Interests</h2>
            <div className="section-content">
              <div className="interests-list">
                {interests.map((interest, index) => (
                  <span key={interest._id || index} className="interest-item">
                    {interest.interestName}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* References */}
        {references && references.length > 0 && (
          <section className="cv-section">
            <h2 className="section-title">References</h2>
            <div className="section-content">
              <div className="references-grid">
                {references.map((reference, index) => (
                  <div key={reference._id || index} className="reference-item">
                    <h4 className="reference-name">{reference.name}</h4>
                    <p className="reference-company">{reference.company}</p>
                    {reference.phone && (
                      <p className="reference-phone">📞 {reference.phone}</p>
                    )}
                    {reference.email && (
                      <p className="reference-email">📧 {reference.email}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template01;
