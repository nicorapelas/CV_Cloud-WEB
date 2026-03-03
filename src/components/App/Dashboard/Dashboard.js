import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context as AuthContext } from '../../../context/AuthContext';
import { Context as NavContext } from '../../../context/NavContext';
import { Context as ClassifiedAdsContext } from '../../../context/ClassifiedAdsContext';
import { Context as PersonalInfoContext } from '../../../context/PersonalInfoContext';
import { Context as PhotoContext } from '../../../context/PhotoContext';
import FirstImpressionCard from './bitCards/FirstImpressionCard';
import PersonalInfoCard from './bitCards/PersonalInfoCard';
import ContactInfoCard from './bitCards/ContactInfoCard';
import PersonalSummaryCard from './bitCards/PersonalSummaryCard';
import ExperienceCard from './bitCards/ExperienceCard';
import EducationCard from './bitCards/EducationCard';
import TertiaryEducationCard from './bitCards/TertiaryEducationCard';
import SkillsCard from './bitCards/SkillsCard';
import LanguagesCard from './bitCards/LanguagesCard';
import AttributesCard from './bitCards/AttributesCard';
import InterestCard from './bitCards/InterestCard';
import ReferencesCard from './bitCards/ReferencesCard';
import PhotoCard from './bitCards/PhotoCard';
import EmploymentHistoryCard from './bitCards/EmploymentHistoryCard';
import CertificateCard from './bitCards/CertificateCard';
import CVVisibilityCard from './bitCards/CVVisibilityCard';
import ClassifiedAdsPreferencesCard from './bitCards/ClassifiedAdsPreferencesCard';
import NotificationCenter from '../../common/NotificationCenter/NotificationCenter';
import DashboardFooter from './DashboardFooter';
import DashboardHeader from './DashboardHeader';
import { getInitials, getAvatarStyle } from '../../../utils/avatarUtils';
import './Dashboard.css';

// Helper function to check if user data is fully loaded
const isUserDataComplete = userObj => {
  return (
    userObj &&
    userObj._id &&
    userObj.email !== undefined &&
    userObj.HR !== undefined // HR property must be explicitly set (true or false)
  );
};

const Dashboard = () => {
  const {
    state: { user, initLoginDone, loading },
    signout,
    setInitLoginDone,
    applyToIntro,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const {
    state: { navTabSelected },
    setNavTabSelected,
  } = useContext(NavContext);

  const { state: { classifiedAdsActive } } = useContext(ClassifiedAdsContext);

  const {
    state: { personalInfo },
    fetchPersonalInfo,
  } = useContext(PersonalInfoContext);

  const {
    state: { assignedPhotoUrl },
    fetchAssignedPhoto,
  } = useContext(PhotoContext);

  // Auto-scroll to top when component mounts
  useEffect(() => {
    // Cross-browser compatible scroll to top
    const scrollToTop = () => {
      if ('scrollBehavior' in document.documentElement.style) {
        // Modern browsers with smooth scrolling support
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback for older browsers or Firefox issues
        window.scrollTo(0, 0);
      }
    };

    // Small delay to ensure component is fully rendered
    setTimeout(scrollToTop, 100);
  }, []);

  useEffect(() => {
    // Only proceed if initLoginDone is explicitly false
    if (initLoginDone === false) {
      // Check if user data is completely loaded (including HR property)
      if (isUserDataComplete(user)) {
        const { HR } = user;

        if (HR === true) {
          navigate('/app/hr-dashboard');
          setInitLoginDone(true);
        } else if (HR === false) {
          navigate('/app/dashboard');
          setInitLoginDone(true);
        }
      }
    }
  }, [initLoginDone, user, loading, navigate]);

  useEffect(() => {
    fetchPersonalInfo();
    fetchAssignedPhoto();
  }, [fetchPersonalInfo, fetchAssignedPhoto]);

  // Credit affiliate when CV user reaches intro completion threshold (same as mobile)
  useEffect(() => {
    if (user && user.HR !== true) {
      applyToIntro();
    }
  }, [user, applyToIntro]);

  return (
    <div className="dashboard">
      <DashboardHeader showSecondaryRow />
      <main className="dashboard-main">
          <div className="dashboard-container">
            <h3 className="dashboard-sections-title">
              Create a professional CV that stands out from the crowd. Start
              with your First Impression video to make a lasting impact.
            </h3>
            {/* Hero First Impression Section */}
            <FirstImpressionCard setNavTabSelected={setNavTabSelected} />

            {/* CV Visibility Settings */}
            <CVVisibilityCard />

            {/* Job listings preferences (CV users only, when feature is on) */}
            {user && user.HR !== true && classifiedAdsActive && (
              <ClassifiedAdsPreferencesCard />
            )}

            {/* Regular CV Sections */}
            <div className="dashboard-sections">
              <div className="dashboard-sections-grid">
                <PhotoCard setNavTabSelected={setNavTabSelected} />
                <PersonalInfoCard setNavTabSelected={setNavTabSelected} />
                <ContactInfoCard setNavTabSelected={setNavTabSelected} />
                <PersonalSummaryCard setNavTabSelected={setNavTabSelected} />
                <EmploymentHistoryCard setNavTabSelected={setNavTabSelected} />
                <ExperienceCard setNavTabSelected={setNavTabSelected} />
                <EducationCard setNavTabSelected={setNavTabSelected} />
                <TertiaryEducationCard setNavTabSelected={setNavTabSelected} />
                <CertificateCard setNavTabSelected={setNavTabSelected} />
                <SkillsCard setNavTabSelected={setNavTabSelected} />
                <LanguagesCard setNavTabSelected={setNavTabSelected} />
                <AttributesCard setNavTabSelected={setNavTabSelected} />
                <InterestCard setNavTabSelected={setNavTabSelected} />
                <ReferencesCard setNavTabSelected={setNavTabSelected} />
              </div>
            </div>
            <div className="dashboard-actions"></div>
          </div>
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
