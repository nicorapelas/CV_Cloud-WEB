import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context as NavContext } from '../../../context/NavContext';
import PersonalInformationForm from '../forms/personalInformation/PersonalInformationForm';
import ContactInformationForm from '../forms/contactInformation/ContactInformationForm';
import PersonalSummaryForm from '../forms/personalSummary/PersonalSummaryForm';
import ExperienceForm from '../forms/experience/ExperienceForm';
import SecondaryEducationForm from '../forms/secondaryEducation/SecondaryEducationForm';
import SkillForm from '../forms/skill/SkillForm';
import LanguageForm from '../forms/language/LanguageForm';
import ReferenceForm from '../forms/reference/ReferenceForm';
import TertiaryEducationForm from '../forms/tertiaryEducation/TertiaryEducationForm';
import InterestForm from '../forms/interest/InterestForm';
import AttributeForm from '../forms/attribute/AttributeForm';
import EmployHistoryForm from '../forms/employmentHistory/EmployHistoryForm';
import PhotoForm from '../forms/photo/PhotoForm';
import FirstImpressionSourceSelector from '../forms/firstImpression/FirstImpressionSourceSelector';
import CertificateForm from '../forms/certificate/CertificateForm';
import './CVBuilder.css';

const CVBuilder = () => {
  const {
    state: { navTabSelected },
  } = useContext(NavContext);

  console.log('🏗️ CVBuilder loaded');
  console.log('📋 Nav tab selected:', navTabSelected);

  const getSectionTitle = () => {
    const sectionMap = {
      personalInfo: 'Personal Information',
      contactInfo: 'Contact Information',
      personalSummary: 'Personal Summary',
      experience: 'Work Experience',
      education: 'Secondary Education',
      tertiaryEducation: 'Tertiary Education',
      certificates: 'Certificates',
      skills: 'Skills',
      attributes: 'Attributes',
      languages: 'Languages',
      references: 'References',
      interest: 'Interest',
      employmentHistory: 'Employment History',
      firstImpression: 'First Impression',
      photo: 'Profile Photo',
    };
    return sectionMap[navTabSelected] || 'CV Builder';
  };

  // Render the appropriate form based on the selected section
  const renderSectionContent = () => {
    switch (navTabSelected) {
      case 'personalInfo':
        return <PersonalInformationForm />;
      case 'contactInfo':
        return <ContactInformationForm />;
      case 'personalSummary':
        return <PersonalSummaryForm />;
      case 'experience':
        return <ExperienceForm />;
      case 'education':
        return <SecondaryEducationForm />;
      case 'skills':
        return <SkillForm />;
      case 'attributes':
        return <AttributeForm />;
      case 'languages':
        return <LanguageForm />;
      case 'references':
        return <ReferenceForm />;
      case 'tertiaryEducation':
        return <TertiaryEducationForm />;
      case 'certificates':
        return <CertificateForm />;
      case 'interest':
        return <InterestForm />;
      case 'employmentHistory':
        return <EmployHistoryForm />;
      case 'photo':
        return <PhotoForm />;
      case 'firstImpression':
        console.log('🎥 Rendering first impression section');
        return <FirstImpressionSourceSelector />;
      default:
        return (
          <div className="cv-builder-content">
            <h2>{getSectionTitle()} - Coming Soon</h2>
            <p>
              This section will contain the {getSectionTitle().toLowerCase()}{' '}
              functionality similar to the mobile app.
            </p>
            <p>Features will include:</p>
            <ul>
              <li>Form-based data entry</li>
              <li>Real-time validation</li>
              <li>Auto-save functionality</li>
              <li>Preview integration</li>
              <li>Mobile-responsive design</li>
            </ul>
            <div className="cv-builder-actions">
              <Link to="/app/dashboard" className="cv-builder-button">
                Back to Dashboard
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="cv-builder">
      <header className="cv-builder-header">
        <div className="cv-builder-header-content">
          <Link to="/app/dashboard" className="cv-builder-back">
            ← Back to Dashboard
          </Link>
          <h1>{getSectionTitle()}</h1>
          <Link to="/app/view-cv" className="cv-builder-view">
            👁️ View CV
          </Link>
        </div>
      </header>

      <main className="cv-builder-main">
        <div className="cv-builder-container">{renderSectionContent()}</div>
      </main>
    </div>
  );
};

export default CVBuilder;
