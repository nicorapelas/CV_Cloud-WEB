import React from 'react';
import './template10.css';

const Template10 = ({ cvData }) => {
  const {
    assignedPhotoUrl,
    assignedPhotoUrlSample,
    contactInfo,
    contactInfoSample,
    personalInfo,
    personalInfoSample,
    languages,
    languageSample,
    attributes,
    attributeSample,
    interests,
    interestSample,
    skills,
    skillSample,
    references,
    referenceSample,
    viewHeading,
    viewHeadingSample,
    personalSummary,
    personalSummarySample,
    employHistorys,
    employHistorySample,
    experiences,
    experienceSample,
    secondEdu,
    secondEduSample,
    tertEdus,
    tertEduSample,
  } = cvData;

  // Use sample data if available, otherwise use real data
  const data = {
    assignedPhotoUrl: assignedPhotoUrlSample || assignedPhotoUrl,
    contactInfo: contactInfoSample?.[0] || contactInfo?.[0],
    personalInfo: personalInfoSample?.[0] || personalInfo?.[0],
    languages: languageSample || languages,
    attributes: attributeSample || attributes,
    interests: interestSample || interests,
    skills: skillSample || skills,
    references: referenceSample || references,
    personalSummary: personalSummarySample?.[0] || personalSummary?.[0],
    employHistorys: employHistorySample || employHistorys,
    experiences: experienceSample || experiences,
    secondEdu: secondEduSample || secondEdu,
    tertEdus: tertEduSample || tertEdus,
  };

  // Helper function to format date
  const formatDate = dateString => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="template10-agriculture">
      <div className="template10-container">
        {/* Farming Header */}
        <div className="template10-header">
          <div className="template10-header-content">
            <div className="template10-logo-section">
              <div className="template10-logo">
                <div className="template10-tractor-icon">🚜</div>
              </div>
            </div>
            <div className="template10-title-section">
              <h1 className="template10-name">
                {data.personalInfo?.fullName || 'AGRICULTURAL PROFESSIONAL'}
              </h1>
              <h2 className="template10-title">
                {data.personalSummary?.content?.split('.')[0] ||
                  'Farming & Agriculture Specialist'}
              </h2>
              <div className="template10-header-divider"></div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="template10-contact-section">
          <div className="template10-contact-grid">
            {data.contactInfo?.email && (
              <div className="template10-contact-item">
                <div className="template10-contact-icon">📧</div>
                <div className="template10-contact-details">
                  <div className="template10-contact-label">Email</div>
                  <div className="template10-contact-value">
                    {data.contactInfo.email}
                  </div>
                </div>
              </div>
            )}
            {data.contactInfo?.phone && (
              <div className="template10-contact-item">
                <div className="template10-contact-icon">📞</div>
                <div className="template10-contact-details">
                  <div className="template10-contact-label">Phone</div>
                  <div className="template10-contact-value">
                    {data.contactInfo.phone}
                  </div>
                </div>
              </div>
            )}
            {data.contactInfo?.address && (
              <div className="template10-contact-item">
                <div className="template10-contact-icon">📍</div>
                <div className="template10-contact-details">
                  <div className="template10-contact-label">Location</div>
                  <div className="template10-contact-value">
                    {data.contactInfo.address}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photo Section */}
        {data.assignedPhotoUrl && (
          <div className="template10-photo-section">
            <img
              src={data.assignedPhotoUrl}
              alt="Profile"
              className="template10-profile-photo"
            />
          </div>
        )}

        {/* Professional Summary */}
        {data.personalSummary && (
          <div className="template10-section">
            <div className="template10-section-header">
              <div className="template10-section-icon">🌱</div>
              <h3 className="template10-section-title">
                PROFESSIONAL OVERVIEW
              </h3>
            </div>
            <div className="template10-section-content">
              <div className="template10-summary-box">
                <p className="template10-summary-text">
                  {data.personalSummary.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="template10-columns">
          {/* Left Column */}
          <div className="template10-left-column">
            {/* Work Experience */}
            {data.experiences && data.experiences.length > 0 && (
              <div className="template10-section">
                <div className="template10-section-header">
                  <div className="template10-section-icon">🚜</div>
                  <h3 className="template10-section-title">
                    AGRICULTURAL EXPERIENCE
                  </h3>
                </div>
                <div className="template10-section-content">
                  {data.experiences.map((experience, index) => (
                    <div
                      key={experience._id || index}
                      className="template10-experience-item"
                    >
                      <div className="template10-experience-header">
                        <h4 className="template10-experience-name">
                          {experience.title}
                        </h4>
                        {experience.company && (
                          <div className="template10-experience-company">
                            {experience.company}
                          </div>
                        )}
                        {(experience.startDate || experience.endDate) && (
                          <div className="template10-experience-dates">
                            {formatDate(experience.startDate)} -{' '}
                            {formatDate(experience.endDate) || 'Present'}
                          </div>
                        )}
                      </div>
                      {experience.description && (
                        <p className="template10-experience-description">
                          {experience.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {(data.tertEdus && data.tertEdus.length > 0) ||
            (data.secondEdu && data.secondEdu.length > 0) ? (
              <div className="template10-section">
                <div className="template10-section-header">
                  <div className="template10-section-icon">🎓</div>
                  <h3 className="template10-section-title">
                    EDUCATION & TRAINING
                  </h3>
                </div>
                <div className="template10-section-content">
                  {/* Tertiary Education */}
                  {data.tertEdus &&
                    data.tertEdus.map((education, index) => (
                      <div
                        key={education._id || index}
                        className="template10-education-item"
                      >
                        <h4 className="template10-education-name">
                          {education.certificationType ||
                            'Agricultural Education'}
                        </h4>
                        <div className="template10-education-institution">
                          {education.instituteName}
                        </div>
                        {education.description && (
                          <p className="template10-education-description">
                            {education.description}
                          </p>
                        )}
                        {education.additionalInfo && (
                          <p className="template10-education-additional">
                            {education.additionalInfo}
                          </p>
                        )}
                      </div>
                    ))}

                  {/* Secondary Education */}
                  {data.secondEdu &&
                    data.secondEdu.map((education, index) => (
                      <div
                        key={education._id || index}
                        className="template10-education-item"
                      >
                        <h4 className="template10-education-name">
                          Secondary Education
                        </h4>
                        <div className="template10-education-institution">
                          {education.schoolName}
                        </div>
                        {education.additionalInfo && (
                          <p className="template10-education-additional">
                            {education.additionalInfo}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}

            {/* References */}
            {data.references && data.references.length > 0 && (
              <div className="template10-section">
                <div className="template10-section-header">
                  <div className="template10-section-icon">🤝</div>
                  <h3 className="template10-section-title">REFERENCES</h3>
                </div>
                <div className="template10-section-content">
                  {data.references.map((reference, index) => (
                    <div
                      key={reference._id || index}
                      className="template10-reference-item"
                    >
                      <h4 className="template10-reference-name">
                        {reference.name}
                      </h4>
                      {reference.position && (
                        <div className="template10-reference-position">
                          {reference.position}
                        </div>
                      )}
                      {reference.email && (
                        <div className="template10-reference-contact">
                          📧 {reference.email}
                        </div>
                      )}
                      {reference.phone && (
                        <div className="template10-reference-contact">
                          📞 {reference.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="template10-right-column">
            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className="template10-section">
                <div className="template10-section-header">
                  <div className="template10-section-icon">⚙️</div>
                  <h3 className="template10-section-title">
                    AGRICULTURAL SKILLS
                  </h3>
                </div>
                <div className="template10-section-content">
                  {data.skills.map((skill, index) => (
                    <div
                      key={skill._id || index}
                      className="template10-skill-item"
                    >
                      <div className="template10-skill-name">{skill.skill}</div>
                      <div className="template10-skill-level">
                        <div className="template10-skill-bar">
                          <div
                            className="template10-skill-progress"
                            style={{
                              width: `${(skill.proficiency / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="template10-skill-rating">
                          {skill.proficiency}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <div className="template10-section">
                <div className="template10-section-header">
                  <div className="template10-section-icon">🌐</div>
                  <h3 className="template10-section-title">LANGUAGES</h3>
                </div>
                <div className="template10-section-content">
                  {data.languages.map((language, index) => (
                    <div
                      key={language._id || index}
                      className="template10-language-item"
                    >
                      <div className="template10-language-name">
                        {language.language}
                      </div>
                      <div className="template10-language-level">
                        {language.proficiency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            {data.attributes && data.attributes.length > 0 && (
              <div className="template10-section">
                <div className="template10-section-header">
                  <div className="template10-section-icon">💪</div>
                  <h3 className="template10-section-title">
                    PERSONAL ATTRIBUTES
                  </h3>
                </div>
                <div className="template10-section-content">
                  <div className="template10-attributes-grid">
                    {data.attributes.map((attribute, index) => (
                      <div
                        key={attribute._id || index}
                        className="template10-attribute-tag"
                      >
                        {attribute.attribute}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Interests */}
            {data.interests && data.interests.length > 0 && (
              <div className="template10-section">
                <div className="template10-section-header">
                  <div className="template10-section-icon">🌾</div>
                  <h3 className="template10-section-title">INTERESTS</h3>
                </div>
                <div className="template10-section-content">
                  <div className="template10-interests-grid">
                    {data.interests.map((interest, index) => (
                      <div
                        key={interest._id || index}
                        className="template10-interest-tag"
                      >
                        {interest.interest}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="template10-footer">
          <div className="template10-footer-content">
            <div className="template10-footer-icon">🌱</div>
            <p className="template10-footer-text">
              Cultivating Excellence in Agriculture
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template10;
