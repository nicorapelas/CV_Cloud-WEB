import React from 'react';
import moment from 'moment';
import './template06.css';

const Template06 = ({ cvData }) => {
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
    return moment(date).format('MMM D, YYYY');
  };

  // Helper function to render proficiency dots
  const renderProficiency = level => {
    const maxLevel = 5;
    const filledDots = Math.min(level, maxLevel);
    const emptyDots = maxLevel - filledDots;

    return (
      <div className="template06-skill-level">
        {[...Array(filledDots)].map((_, i) => (
          <div key={`filled-${i}`} className="template06-skill-dot filled" />
        ))}
        {[...Array(emptyDots)].map((_, i) => (
          <div key={`empty-${i}`} className="template06-skill-dot" />
        ))}
      </div>
    );
  };

  // Helper function to render subjects array
  const renderSubjects = subjects => {
    if (!subjects || subjects.length === 0) return null;
    return subjects.map((subject, index) => (
      <span key={subject._id || index} className="template06-subject-tag">
        {subject.subject}
      </span>
    ));
  };

  return (
    <div className="template06-newspaper">
      {/* Newspaper Header */}
      <header className="template06-header">
        <div className="template06-masthead">
          <h1 className="template06-newspaper-title">THE CURRICULUM VITAE</h1>
          <div className="template06-date-line">
            <span className="template06-date">
              {moment().format('MMMM D, YYYY')}
            </span>
            <span className="template06-volume">Vol. 1, No. 1</span>
          </div>
        </div>
        <div className="template06-header-line"></div>
      </header>

      {/* Main Content */}
      <main className="template06-main">
        {/* Front Page Headlines */}
        <section className="template06-front-page">
          <div className="template06-headline-section">
            <h2 className="template06-main-headline">
              {personalInfo?.fullName || 'PROFESSIONAL PROFILE'}
            </h2>
            <div className="template06-subheadline">
              {personalSummary?.content ||
                'Experienced Professional Seeking New Opportunities'}
            </div>
          </div>

          {/* Photo Section */}
          {assignedPhotoUrl && (
            <div className="template06-photo-section">
              <img
                src={assignedPhotoUrl}
                alt="Profile"
                className="template06-profile-photo"
              />
              <div className="template06-photo-caption">
                Professional Headshot
              </div>
            </div>
          )}
        </section>

        {/* Contact Information */}
        <section className="template06-contact-section">
          <h3 className="template06-section-headline">CONTACT INFORMATION</h3>
          <div className="template06-contact-grid">
            {contactInfo?.email && (
              <div className="template06-contact-item">
                <strong>Email:</strong> {contactInfo.email}
              </div>
            )}
            {contactInfo?.phone && (
              <div className="template06-contact-item">
                <strong>Phone:</strong> {contactInfo.phone}
              </div>
            )}
            {(contactInfo?.address || contactInfo?.city) && (
              <div className="template06-contact-item">
                <strong>Location:</strong>{' '}
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
        </section>

        {/* Personal Information */}
        {personalInfo && (
          <section className="template06-section">
            <h3 className="template06-section-headline">PERSONAL DETAILS</h3>
            <div className="template06-personal-grid">
              {personalInfo.dateOfBirth && (
                <div className="template06-personal-item">
                  <strong>Date of Birth:</strong>{' '}
                  {formatDate(personalInfo.dateOfBirth)}
                </div>
              )}
              {personalInfo.gender && (
                <div className="template06-personal-item">
                  <strong>Gender:</strong> {personalInfo.gender}
                </div>
              )}
              {personalInfo.nationality && (
                <div className="template06-personal-item">
                  <strong>Nationality:</strong> {personalInfo.nationality}
                </div>
              )}
              {personalInfo.driversLicense && (
                <div className="template06-personal-item">
                  <strong>Driver's License:</strong>{' '}
                  {personalInfo.licenseCode || 'Valid'}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Two Column Layout */}
        <div className="template06-columns">
          {/* Left Column */}
          <div className="template06-column template06-left-column">
            {/* Professional Summary */}
            {personalSummary && (
              <section className="template06-section">
                <h3 className="template06-section-headline">
                  PROFESSIONAL SUMMARY
                </h3>
                <div className="template06-summary-text">
                  {personalSummary.content}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {experiences && experiences.length > 0 && (
              <section className="template06-section">
                <h3 className="template06-section-headline">WORK EXPERIENCE</h3>
                <div className="template06-experiences">
                  {experiences.map((experience, index) => (
                    <article
                      key={experience._id || index}
                      className="template06-experience-item"
                    >
                      <h4 className="template06-experience-title">
                        {experience.title}
                      </h4>
                      <div className="template06-experience-description">
                        {experience.description}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Employment History */}
            {employHistorys && employHistorys.length > 0 && (
              <section className="template06-section">
                <h3 className="template06-section-headline">
                  EMPLOYMENT HISTORY
                </h3>
                <div className="template06-employment-list">
                  {employHistorys.map((job, index) => (
                    <article
                      key={job._id || index}
                      className="template06-employment-item"
                    >
                      <div className="template06-employment-header">
                        <h4 className="template06-employment-title">
                          {job.position}
                        </h4>
                        <div className="template06-employment-company">
                          {job.company}
                        </div>
                        <div className="template06-employment-dates">
                          {job.startDate} -{' '}
                          {job.current ? 'Present' : job.endDate}
                        </div>
                      </div>
                      <div className="template06-employment-description">
                        {job.description}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="template06-column template06-right-column">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <section className="template06-section">
                <h3 className="template06-section-headline">SKILLS</h3>
                <div className="template06-skills">
                  {skills.map((skill, index) => (
                    <div
                      key={skill._id || index}
                      className="template06-skill-item"
                    >
                      <div className="template06-skill-name">{skill.skill}</div>
                      {renderProficiency(skill.proficiency)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <section className="template06-section">
                <h3 className="template06-section-headline">LANGUAGES</h3>
                <div className="template06-languages">
                  {languages.map((language, index) => (
                    <div
                      key={language._id || index}
                      className="template06-language-item"
                    >
                      <div className="template06-language-name">
                        {language.language}
                      </div>
                      <div className="template06-language-proficiency">
                        Read: {language.read}/5 | Write: {language.write}/5 |
                        Speak: {language.speak}/5
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Attributes */}
            {attributes && attributes.length > 0 && (
              <section className="template06-section">
                <h3 className="template06-section-headline">
                  PERSONAL ATTRIBUTES
                </h3>
                <div className="template06-attributes">
                  {attributes.map((attribute, index) => (
                    <span
                      key={attribute._id || index}
                      className="template06-attribute-tag"
                    >
                      {attribute.attribute}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Interests */}
            {interests && interests.length > 0 && (
              <section className="template06-section">
                <h3 className="template06-section-headline">INTERESTS</h3>
                <div className="template06-interests">
                  {interests.map((interest, index) => (
                    <span
                      key={interest._id || index}
                      className="template06-interest-tag"
                    >
                      {interest.interest}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Education Section - Full Width */}
        <section className="template06-section template06-full-width">
          <h3 className="template06-section-headline">EDUCATION</h3>

          {/* Tertiary Education */}
          {tertEdus && tertEdus.length > 0 && (
            <div className="template06-education-section">
              <h4 className="template06-education-subheadline">
                TERTIARY EDUCATION
              </h4>
              <div className="template06-education-grid">
                {tertEdus.map((edu, index) => (
                  <article
                    key={edu._id || index}
                    className="template06-education-item"
                  >
                    <div className="template06-education-header">
                      <h5 className="template06-education-title">
                        {edu.instituteName}
                      </h5>
                      <div className="template06-education-dates">
                        {edu.startDate} - {edu.endDate}
                      </div>
                    </div>
                    <div className="template06-education-type">
                      {edu.certificationType}
                    </div>
                    {edu.description && (
                      <div className="template06-education-description">
                        {edu.description}
                      </div>
                    )}
                    {edu.additionalInfo && (
                      <div className="template06-education-additional">
                        {edu.additionalInfo}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Education */}
          {secondEdu && secondEdu.length > 0 && (
            <div className="template06-education-section">
              <h4 className="template06-education-subheadline">
                SECONDARY EDUCATION
              </h4>
              <div className="template06-education-grid">
                {secondEdu.map((edu, index) => (
                  <article
                    key={edu._id || index}
                    className="template06-education-item"
                  >
                    <div className="template06-education-header">
                      <h5 className="template06-education-title">
                        {edu.schoolName}
                      </h5>
                      <div className="template06-education-dates">
                        {edu.startDate} - {edu.endDate}
                      </div>
                    </div>
                    {edu.subjects && edu.subjects.length > 0 && (
                      <div className="template06-education-subjects">
                        <strong>Subjects:</strong>{' '}
                        {renderSubjects(edu.subjects)}
                      </div>
                    )}
                    {edu.additionalInfo && (
                      <div className="template06-education-additional">
                        {edu.additionalInfo}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* References Section */}
        {references && references.length > 0 && (
          <section className="template06-section template06-full-width">
            <h3 className="template06-section-headline">REFERENCES</h3>
            <div className="template06-references-grid">
              {references.map((reference, index) => (
                <div
                  key={reference._id || index}
                  className="template06-reference-item"
                >
                  <div className="template06-reference-name">
                    {reference.name}
                  </div>
                  <div className="template06-reference-company">
                    {reference.company}
                  </div>
                  <div className="template06-reference-contact">
                    {reference.email && <div>Email: {reference.email}</div>}
                    {reference.phone && <div>Phone: {reference.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Newspaper Footer */}
      <footer className="template06-footer">
        <div className="template06-footer-line"></div>
        <div className="template06-footer-text">
          <span>THE CURRICULUM VITAE</span>
          <span>Professional Profile</span>
          <span>{moment().format('YYYY')}</span>
        </div>
      </footer>
    </div>
  );
};

export default Template06;
