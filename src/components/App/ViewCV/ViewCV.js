import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as PersonalInfoContext } from '../../../context/PersonalInfoContext';
import { Context as ContactInfoContext } from '../../../context/ContactInfoContext';
import { Context as PersonalSummaryContext } from '../../../context/PersonalSummaryContext';
import { Context as ExperienceContext } from '../../../context/ExperienceContext';
import { Context as SecondEduContext } from '../../../context/SecondEduContext';
import { Context as SkillContext } from '../../../context/SkillContext';
import { Context as LanguageContext } from '../../../context/LanguageContext';
import { Context as ReferenceContext } from '../../../context/ReferenceContext';
import { Context as TertEduContext } from '../../../context/TertEduContext';
import { Context as InterestContext } from '../../../context/InterestContext';
import { Context as AttributeContext } from '../../../context/AttributeContext';
import { Context as EmployHistoryContext } from '../../../context/EmployHistoryContext';
import { Context as PhotoContext } from '../../../context/PhotoContext';
import Template01 from './templates/template01/Template01';
import Template02 from './templates/template02/Template02';
import Template03 from './templates/template03/Template03';
import Template04 from './templates/template04/Template04';
import Template05 from './templates/template05/Template05';
import Template06 from './templates/template06/Template06';
import Template07 from './templates/template07/Template07';
import Template08 from './templates/template08/Template08';
import Template09 from './templates/template09/Template09';
import Template10 from './templates/template10/Template10';
import Loader from '../../common/loader/Loader';
import './ViewCV.css';

const ViewCV = () => {
  const {
    state: { user },
  } = useContext(AuthContext);

  // Context hooks for all CV data
  const {
    state: { personalInfo, loading: personalInfoLoading },
    fetchPersonalInfo,
  } = useContext(PersonalInfoContext);
  const {
    state: { contactInfo, loading: contactInfoLoading },
    fetchContactInfo,
  } = useContext(ContactInfoContext);
  const {
    state: { personalSummary, loading: personalSummaryLoading },
    fetchPersonalSummary,
  } = useContext(PersonalSummaryContext);
  const {
    state: { experiences, loading: experienceLoading },
    fetchExperiences,
  } = useContext(ExperienceContext);
  const {
    state: { secondEdu, loading: secondEduLoading },
    fetchSecondEdu,
  } = useContext(SecondEduContext);
  const {
    state: { skills, loading: skillLoading },
    fetchSkills,
  } = useContext(SkillContext);
  const {
    state: { languages, loading: languageLoading },
    fetchLanguages,
  } = useContext(LanguageContext);
  const {
    state: { references, loading: referenceLoading },
    fetchReferences,
  } = useContext(ReferenceContext);
  const {
    state: { tertEdus, loading: tertEduLoading },
    fetchTertEdus,
  } = useContext(TertEduContext);
  const {
    state: { interests, loading: interestLoading },
    fetchInterests,
  } = useContext(InterestContext);
  const {
    state: { attributes, loading: attributeLoading },
    fetchAttributes,
  } = useContext(AttributeContext);
  const {
    state: { employHistorys, loading: employHistoryLoading },
    fetchEmployHistorys,
  } = useContext(EmployHistoryContext);
  const {
    state: { assignedPhotoUrl, loading: photoLoading },
    fetchAssignedPhoto,
  } = useContext(PhotoContext);

  // State for template selection (for future use)
  const [selectedTemplate, setSelectedTemplate] = useState('template01');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all CV data when component mounts
  useEffect(() => {
    const fetchAllCVData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchPersonalInfo(),
          fetchContactInfo(),
          fetchPersonalSummary(),
          fetchExperiences(),
          fetchSecondEdu(),
          fetchSkills(),
          fetchLanguages(),
          fetchReferences(),
          fetchTertEdus(),
          fetchInterests(),
          fetchAttributes(),
          fetchEmployHistorys(),
          fetchAssignedPhoto(),
        ]);
      } catch (error) {
        console.error('Error fetching CV data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAllCVData();
    }
  }, [
    user,
    fetchPersonalInfo,
    fetchContactInfo,
    fetchPersonalSummary,
    fetchExperiences,
    fetchSecondEdu,
    fetchSkills,
    fetchLanguages,
    fetchReferences,
    fetchTertEdus,
    fetchInterests,
    fetchAttributes,
    fetchEmployHistorys,
    fetchAssignedPhoto,
  ]);

  // Check if any data is still loading
  const isDataLoading =
    personalInfoLoading ||
    contactInfoLoading ||
    personalSummaryLoading ||
    experienceLoading ||
    secondEduLoading ||
    skillLoading ||
    languageLoading ||
    referenceLoading ||
    tertEduLoading ||
    interestLoading ||
    attributeLoading ||
    employHistoryLoading ||
    photoLoading;

  // Prepare CV data object
  const cvData = {
    personalInfo: personalInfo?.[0] || null,
    contactInfo: contactInfo?.[0] || null,
    personalSummary: personalSummary?.[0] || null,
    experiences: experiences || [],
    secondEdu: secondEdu || [],
    skills: skills || [],
    languages: languages || [],
    references: references || [],
    tertEdus: tertEdus || [],
    interests: interests || [],
    attributes: attributes || [],
    employHistorys: employHistorys || [],
    assignedPhotoUrl: assignedPhotoUrl,
  };

  // Render template based on selection
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'template01':
        return <Template01 cvData={cvData} />;
      case 'template02':
        return <Template02 cvData={cvData} />;
      case 'template03':
        return <Template03 cvData={cvData} />;
      case 'template04':
        return <Template04 cvData={cvData} />;
      case 'template05':
        return <Template05 cvData={cvData} />;
      case 'template06':
        return <Template06 cvData={cvData} />;
      case 'template07':
        return <Template07 cvData={cvData} />;
      case 'template08':
        return <Template08 cvData={cvData} />;
      case 'template09':
        return <Template09 cvData={cvData} />;
      case 'template10':
        return <Template10 cvData={cvData} />;
      default:
        return <Template01 cvData={cvData} />;
    }
  };

  console.log('cvData:', cvData);

  if (isLoading || isDataLoading) {
    return <Loader show={true} message="Loading your CV..." />;
  }

  return (
    <div className="view-cv-container">
      <div className="view-cv-header">
        <div className="view-cv-header-left">
          <Link to="/app/dashboard" className="view-cv-back">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="view-cv-header-center">
          <div className="view-cv-header-icon">📄</div>
          <div className="view-cv-header-content">
            <h1>Your CV</h1>
            <p>Preview and manage your CV templates</p>
          </div>
        </div>
        <div className="view-cv-header-actions">
          <button
            className="view-cv-print-button"
            onClick={() => {
              console.log('Print button clicked');
              console.log('Selected template:', selectedTemplate);
              console.log(
                'Template wrapper exists:',
                document.querySelector(
                  '.template01-wrapper, .template02-wrapper'
                )
              );
              window.print();
            }}
            title="Print CV"
          >
            🖨️ Print CV
          </button>
          <div className="template-selector">
            <label htmlFor="template-select">Template:</label>
            <select
              id="template-select"
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
            >
              <option value="template01">Modern</option>
              <option value="template02">Clean</option>
              <option value="template03">Creative</option>
              <option value="template04">Dark</option>
              <option value="template05">Tech</option>
              <option value="template06">Newspaper</option>
              <option value="template07">Finance</option>
              <option value="template08">Menu</option>
              <option value="template09">Industrial</option>
              <option value="template10">Agriculture</option>
              {/* Future templates will be added here */}
            </select>
          </div>
        </div>
      </div>

      <div className="cv-preview-container">{renderTemplate()}</div>
    </div>
  );
};

export default ViewCV;
