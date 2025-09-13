import React from 'react';
import moment from 'moment';
import './template08.css';

const Template08 = ({ cvData }) => {
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

  // Helper function to render proficiency stars
  const renderProficiency = level => {
    const maxStars = 5;
    const filledStars = Math.min(level, maxStars);
    const emptyStars = maxStars - filledStars;

    return (
      <div className="template08-stars">
        {[...Array(filledStars)].map((_, i) => (
          <span key={`filled-${i}`} className="template08-star filled">
            ★
          </span>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="template08-star">
            ☆
          </span>
        ))}
      </div>
    );
  };

  // Helper function to render subjects array
  const renderSubjects = subjects => {
    if (!subjects || subjects.length === 0) return null;
    return subjects.map((subject, index) => (
      <span key={subject._id || index} className="template08-subject-tag">
        {subject.subject}
      </span>
    ));
  };

  return (
    <div className="template08-menu">
      {/* Restaurant Header */}
      <header className="template08-header">
        <div className="template08-restaurant-name">
          {personalInfo?.fullName || 'PROFESSIONAL PROFILE'}
        </div>
        <div className="template08-restaurant-tagline">
          {personalSummary?.content?.split('.')[0] ||
            'Experienced Professional'}
        </div>
        <div className="template08-header-divider"></div>
      </header>

      {/* Contact Information */}
      <section className="template08-contact-section">
        <div className="template08-contact-grid">
          {contactInfo?.email && (
            <div className="template08-contact-item">
              <span className="template08-contact-label">Email:</span>
              <span className="template08-contact-value">
                {contactInfo.email}
              </span>
            </div>
          )}
          {contactInfo?.phone && (
            <div className="template08-contact-item">
              <span className="template08-contact-label">Phone:</span>
              <span className="template08-contact-value">
                {contactInfo.phone}
              </span>
            </div>
          )}
          {(contactInfo?.address || contactInfo?.city) && (
            <div className="template08-contact-item">
              <span className="template08-contact-label">Location:</span>
              <span className="template08-contact-value">
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
      </section>

      {/* Photo Section */}
      {assignedPhotoUrl && (
        <section className="template08-photo-section">
          <img
            src={assignedPhotoUrl}
            alt="Profile"
            className="template08-profile-photo"
          />
        </section>
      )}

      {/* Menu Sections */}
      <main className="template08-main">
        {/* Professional Summary */}
        {personalSummary && (
          <section className="template08-menu-section">
            <h2 className="template08-section-title">ABOUT US</h2>
            <div className="template08-section-content">
              <p className="template08-summary-text">
                {personalSummary.content}
              </p>
            </div>
          </section>
        )}

        {/* Two Column Layout */}
        <div className="template08-columns">
          {/* Left Column */}
          <div className="template08-left-column">
            {/* Work Experience */}
            {experiences && experiences.length > 0 && (
              <section className="template08-menu-section">
                <h2 className="template08-section-title">EXPERIENCE</h2>
                <div className="template08-section-content">
                  {experiences.map((experience, index) => (
                    <div
                      key={experience._id || index}
                      className="template08-menu-item"
                    >
                      <div className="template08-item-header">
                        <h3 className="template08-item-name">
                          {experience.title}
                        </h3>
                        <div className="template08-item-price">
                          {formatDate(experience.startDate)} -{' '}
                          {experience.endDate
                            ? formatDate(experience.endDate)
                            : 'Present'}
                        </div>
                      </div>
                      <div className="template08-item-description">
                        <strong>{experience.company}</strong>
                        {experience.description && (
                          <p>{experience.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Employment History */}
            {employHistorys && employHistorys.length > 0 && (
              <section className="template08-menu-section">
                <h2 className="template08-section-title">EMPLOYMENT</h2>
                <div className="template08-section-content">
                  {employHistorys.map((employment, index) => (
                    <div
                      key={employment._id || index}
                      className="template08-menu-item"
                    >
                      <div className="template08-item-header">
                        <h3 className="template08-item-name">
                          {employment.position}
                        </h3>
                        <div className="template08-item-price">
                          {formatDate(employment.startDate)} -{' '}
                          {employment.endDate
                            ? formatDate(employment.endDate)
                            : 'Present'}
                        </div>
                      </div>
                      <div className="template08-item-description">
                        <strong>{employment.company}</strong>
                        {employment.description && (
                          <p>{employment.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {(tertEdus && tertEdus.length > 0) ||
            (secondEdu && secondEdu.length > 0) ? (
              <section className="template08-menu-section">
                <h2 className="template08-section-title">EDUCATION</h2>
                <div className="template08-section-content">
                  {/* Tertiary Education */}
                  {tertEdus &&
                    tertEdus.map((education, index) => (
                      <div
                        key={education._id || index}
                        className="template08-menu-item"
                      >
                        <div className="template08-item-header">
                          <h3 className="template08-item-name">
                            {education.qualification}
                          </h3>
                          <div className="template08-item-price">
                            {formatDate(education.startDate)} -{' '}
                            {education.endDate
                              ? formatDate(education.endDate)
                              : 'Present'}
                          </div>
                        </div>
                        <div className="template08-item-description">
                          <strong>{education.institution}</strong>
                          {education.subjects && (
                            <div className="template08-subjects">
                              {renderSubjects(education.subjects)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* Secondary Education */}
                  {secondEdu &&
                    secondEdu.map((education, index) => (
                      <div
                        key={education._id || index}
                        className="template08-menu-item"
                      >
                        <div className="template08-item-header">
                          <h3 className="template08-item-name">
                            {education.qualification}
                          </h3>
                          <div className="template08-item-price">
                            {formatDate(education.startDate)} -{' '}
                            {education.endDate
                              ? formatDate(education.endDate)
                              : 'Present'}
                          </div>
                        </div>
                        <div className="template08-item-description">
                          <strong>{education.institution}</strong>
                          {education.subjects && (
                            <div className="template08-subjects">
                              {renderSubjects(education.subjects)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Right Column */}
          <div className="template08-right-column">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <section className="template08-menu-section">
                <h2 className="template08-section-title">SKILLS</h2>
                <div className="template08-section-content">
                  {skills.map((skill, index) => (
                    <div
                      key={skill._id || index}
                      className="template08-skill-item"
                    >
                      <div className="template08-skill-header">
                        <span className="template08-skill-name">
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
              <section className="template08-menu-section">
                <h2 className="template08-section-title">LANGUAGES</h2>
                <div className="template08-section-content">
                  {languages.map((language, index) => (
                    <div
                      key={language._id || index}
                      className="template08-language-item"
                    >
                      <div className="template08-language-header">
                        <span className="template08-language-name">
                          {language.language}
                        </span>
                        <span className="template08-language-level">
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
              <section className="template08-menu-section">
                <h2 className="template08-section-title">ATTRIBUTES</h2>
                <div className="template08-section-content">
                  <div className="template08-attributes-grid">
                    {attributes.map((attribute, index) => (
                      <span
                        key={attribute._id || index}
                        className="template08-attribute-tag"
                      >
                        {attribute.attribute}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Interests */}
            {interests && interests.length > 0 && (
              <section className="template08-menu-section">
                <h2 className="template08-section-title">INTERESTS</h2>
                <div className="template08-section-content">
                  <div className="template08-interests-grid">
                    {interests.map((interest, index) => (
                      <span
                        key={interest._id || index}
                        className="template08-interest-tag"
                      >
                        {interest.interest}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* References */}
        {references && references.length > 0 && (
          <section className="template08-menu-section">
            <h2 className="template08-section-title">REFERENCES</h2>
            <div className="template08-section-content">
              {references.map((reference, index) => (
                <div
                  key={reference._id || index}
                  className="template08-reference-item"
                >
                  <div className="template08-reference-header">
                    <h3 className="template08-reference-name">
                      {reference.name}
                    </h3>
                  </div>
                  <div className="template08-reference-details">
                    <p>
                      <strong>{reference.position}</strong> at{' '}
                      {reference.company}
                    </p>
                    {reference.contact && <p>Contact: {reference.contact}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="template08-footer">
        <div className="template08-footer-text">
          Thank you for your consideration
        </div>
      </footer>
    </div>
  );
};

export default Template08;
