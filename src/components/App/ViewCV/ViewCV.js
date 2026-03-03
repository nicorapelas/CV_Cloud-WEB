import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
import { Context as ShareCVContext } from '../../../context/ShareCVContext';
import { Context as PublicCVContext } from '../../../context/PublicCVContext';
import api from '../../../api/api';
import CVTemplateRenderer from './CVTemplateRenderer';
import Loader from '../../common/loader/Loader';
import PrintOptionsModal from '../SharedCVView/PrintOptionsModal';
import InkFriendlyTemplate from '../SharedCVView/InkFriendlyTemplate';
import NotificationCenter from '../../common/NotificationCenter/NotificationCenter';
import './ViewCV.css';
import '../../../styles/print.css';

// Valid template options
const VALID_TEMPLATES = [
  'template01', 'template02', 'template03', 'template04', 'template05',
  'template06', 'template07', 'template08', 'template09', 'template10'
];
const DEFAULT_TEMPLATE = 'template01'; // Modern template

const ViewCV = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/app/dashboard');
    }
  };

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

  const {
    state: { cvTemplateSelected },
    setCVTemplateSelected,
  } = useContext(ShareCVContext);

  const {
    state: { isListed },
    fetchPublicCVStatus,
  } = useContext(PublicCVContext);

  // State for template selection (for future use)
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printMode, setPrintMode] = useState('template'); // 'template' or 'ink-friendly'
  const [shouldPrint, setShouldPrint] = useState(false);

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

  // Handle print when shouldPrint changes
  useEffect(() => {
    if (shouldPrint) {
      setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, 100);
    }
  }, [shouldPrint, printMode]);

  // Initialize template on mount with priority: URL > Database > localStorage > default
  // Database is checked before localStorage to ensure cross-platform sync
  const hasInitialized = useRef(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (hasInitialized.current || !user) return;

    const initializeTemplate = async () => {
      let selectedTemplate = null;

      // Priority 1: Check URL parameter (for sharing/bookmarking)
      const templateFromUrl = searchParams.get('template');
      if (templateFromUrl && VALID_TEMPLATES.includes(templateFromUrl)) {
        selectedTemplate = templateFromUrl;
        console.log('📋 Template from URL:', selectedTemplate);
      } else {
        // Priority 2: Fetch from database (for cross-platform sync)
        try {
          const response = await api.get('/api/user-preferences/cv-template');
          if (response.data?.cvTemplate && VALID_TEMPLATES.includes(response.data.cvTemplate)) {
            selectedTemplate = response.data.cvTemplate;
            console.log('📋 Template from database:', selectedTemplate);
            // Also save to localStorage as backup
            localStorage.setItem('cvTemplate', selectedTemplate);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch template from database:', error);
          // Fall through to localStorage
        }

        // Priority 3: Check localStorage (as fallback if database unavailable)
        if (!selectedTemplate) {
          const templateFromStorage = localStorage.getItem('cvTemplate');
          if (templateFromStorage && VALID_TEMPLATES.includes(templateFromStorage)) {
            selectedTemplate = templateFromStorage;
            console.log('📋 Template from localStorage:', selectedTemplate);
          }
        }

        // Priority 4: Use default
        if (!selectedTemplate) {
          selectedTemplate = DEFAULT_TEMPLATE;
          console.log('📋 Using default template:', selectedTemplate);
        }

        // Update URL if not already set
        if (!templateFromUrl) {
          const newParams = new URLSearchParams(searchParams);
          newParams.set('template', selectedTemplate);
          setSearchParams(newParams, { replace: true });
        }
      }

      // Set the template
      setCVTemplateSelected(selectedTemplate);
      hasInitialized.current = true;
    };

    initializeTemplate();
  }, [user, searchParams, setSearchParams, setCVTemplateSelected]);

  // Update URL and save to database/localStorage when template changes (but not on initial mount)
  const isInitialMount = useRef(true);
  const previousTemplate = useRef(cvTemplateSelected);
  
  useEffect(() => {
    if (isInitialMount.current || !hasInitialized.current) {
      isInitialMount.current = false;
      previousTemplate.current = cvTemplateSelected;
      return;
    }

    // Only update if template actually changed (not from initialization)
    if (cvTemplateSelected !== previousTemplate.current && cvTemplateSelected) {
      // Update URL
      const currentUrlTemplate = searchParams.get('template');
      if (cvTemplateSelected !== currentUrlTemplate) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('template', cvTemplateSelected);
        setSearchParams(newParams, { replace: true });
      }

      // Save to localStorage as backup
      localStorage.setItem('cvTemplate', cvTemplateSelected);

      // Save to database (debounced to avoid too many API calls)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await api.put('/api/user-preferences/cv-template', {
            cvTemplate: cvTemplateSelected,
          });
          console.log('✅ Template preference saved to database:', cvTemplateSelected);
        } catch (error) {
          console.warn('⚠️ Could not save template to database:', error);
          // Don't show error to user - localStorage backup is sufficient
        }
      }, 500); // 500ms debounce
      
      previousTemplate.current = cvTemplateSelected;
    }
  }, [cvTemplateSelected, searchParams, setSearchParams, user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Fetch public CV status on mount
  useEffect(() => {
    if (user) {
      fetchPublicCVStatus();
    }
  }, [user, fetchPublicCVStatus]);

  // Track if this is the first render to avoid calling API on mount
  const isFirstRender = useRef(true);

  // Update PublicCV template on server when template changes (if CV is public)
  useEffect(() => {
    // Skip on initial mount or if CV is not public
    if (!cvTemplateSelected || !isListed) {
      return;
    }

    // Skip the first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Debounce the update
    const timeoutId = setTimeout(async () => {
      try {
        console.log(
          '🔄 Template changed, updating PublicCV template:',
          cvTemplateSelected
        );
        await api.put('/api/public-cv/template', {
          cvTemplate: cvTemplateSelected,
        });
        console.log('✅ PublicCV template updated successfully');
      } catch (error) {
        console.error('❌ Error updating PublicCV template:', error);
        // Don't show error to user - template still works locally
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cvTemplateSelected, isListed]);

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

  // Prepare CV data object - memoized to prevent unnecessary re-renders
  const cvData = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  // Render template using reusable component
  const renderTemplate = () => {
    return (
      <CVTemplateRenderer
        cvData={cvData}
        templateSelected={cvTemplateSelected}
      />
    );
  };

  // Removed console.log to reduce noise - use React DevTools Profiler to debug re-renders

  // Print handler functions
  const handlePrint = () => {
    setShowPrintOptions(true);
  };

  const handlePrintInkFriendly = () => {
    setPrintMode('ink-friendly');
    setShowPrintOptions(false);
    setShouldPrint(true);
  };

  const handlePrintTemplate = () => {
    setPrintMode('template');
    setShowPrintOptions(false);
    setShouldPrint(true);
  };

  const handleClosePrintOptions = () => {
    setShowPrintOptions(false);
  };

  if (isLoading || isDataLoading) {
    return <Loader show={true} message="Loading your CV..." />;
  }

  return (
    <div
      className={`view-cv-container ${printMode === 'ink-friendly' ? 'ink-friendly-mode' : ''}`}
    >
      <div className="view-cv-inner">
        <div className="view-cv-header">
          <div className="view-cv-header-left">
            <button type="button" onClick={handleBack} className="view-cv-back">
              ← Back
            </button>
          </div>
          <div className="view-cv-header-center">
            <div className="view-cv-header-icon">📄</div>
            <div className="view-cv-header-content">
              <h1>Your CV</h1>
              <p>Preview and manage your CV templates</p>
            </div>
          </div>
          <div className="view-cv-header-actions">
            <NotificationCenter />
            <Link
              to="/app/share-cv"
              className="view-cv-share-button"
              title="Share CV"
            >
              📤 Share CV
            </Link>
            <button
              className="view-cv-print-button"
              onClick={handlePrint}
              title="Print CV"
            >
              🖨️ Print CV
            </button>
            <div className="template-selector">
              <label htmlFor="template-select">Template:</label>
              <select
                id="template-select"
                value={cvTemplateSelected}
                onChange={e => setCVTemplateSelected(e.target.value)}
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

        <div className="cv-preview-container">
          {printMode === 'ink-friendly' ? (
            <InkFriendlyTemplate cvData={cvData} />
          ) : (
            renderTemplate()
          )}
        </div>
      </div>

      {/* Print Options Modal */}
      <PrintOptionsModal
        isOpen={showPrintOptions}
        onClose={handleClosePrintOptions}
        onPrintInkFriendly={handlePrintInkFriendly}
        onPrintTemplate={handlePrintTemplate}
      />
    </div>
  );
};

export default ViewCV;
