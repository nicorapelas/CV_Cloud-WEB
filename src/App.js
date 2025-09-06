import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {
  Context as AuthContext,
  Provider as AuthProvider,
} from './context/AuthContext';
import { Provider as NavProvider } from './context/NavContext';
import { Provider as PersonalInfoProvider } from './context/PersonalInfoContext';
import { Provider as ContactInfoProvider } from './context/ContactInfoContext';
import { Provider as PersonalSummaryProvider } from './context/PersonalSummaryContext';
import { Provider as ExperienceProvider } from './context/ExperienceContext';
import { Provider as SecondEduProvider } from './context/SecondEduContext';
import { Provider as SkillProvider } from './context/SkillContext';
import { Provider as LanguageProvider } from './context/LanguageContext';
import { Provider as ReferenceProvider } from './context/ReferenceContext';
import { Provider as TertEduProvider } from './context/TertEduContext';
import { Provider as InterestProvider } from './context/InterestContext';
import { Provider as EmployHistoryProvider } from './context/EmployHistoryContext';
import { Provider as PhotoProvider } from './context/PhotoContext';
import { Provider as FirstImpressionProvider } from './context/FirstImpressionContext';
import { Provider as CertificateProvider } from './context/CertificateContext';
import { Provider as ShareCVProvider } from './context/ShareCVContext';
import { Provider as UniversalProvider } from './context/UniversalContext';
import { RealTimeProvider } from './context/RealTimeContext';

// Landing and Auth Components
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Auth/Login/Login';
import Signup from './components/Auth/Signup/Signup';

// App Components (to be created)
import Dashboard from './components/App/Dashboard/Dashboard';
import CVBuilder from './components/App/CVBuilder/CVBuilder';
import ViewCV from './components/App/ViewCV/ViewCV';
import ShareCV from './components/App/ShareCV/ShareCV';

// Common Components
import Loader from './components/common/loader/Loader';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { state } = useContext(AuthContext);

  // Debug logging
  console.log('ProtectedRoute - Auth state:', {
    token: state.token,
    user: state.user,
    hasToken: !!state.token,
    hasUser: !!state.user,
    isAuthenticated: !!(state.token || state.user),
  });

  // Check if user is authenticated (either has token or is web-authenticated)
  if (!state.token && !state.user) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return children;
};

// App Routes Component
const AppRoutes = () => {
  const {
    state: { loading, token, user },
    tryLocalSignin,
    fetchUser,
  } = useContext(AuthContext);

  React.useEffect(() => {
    tryLocalSignin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Periodic session check for authenticated users
  React.useEffect(() => {
    if (token || user) {
      // Check session validity every 5 minutes
      const sessionCheckInterval = setInterval(
        async () => {
          try {
            await fetchUser();
          } catch (error) {
            console.log(
              'Session check failed, user may need to re-authenticate'
            );
          }
        },
        5 * 60 * 1000
      ); // 5 minutes

      return () => clearInterval(sessionCheckInterval);
    }
  }, [token, user, fetchUser]);

  return (
    <>
      <Loader show={loading} message="Authenticating..." />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App Routes */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/cv-builder"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <CVBuilder />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/view-cv"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <ViewCV />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/share-cv"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <ShareCV />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavProvider>
          <PersonalInfoProvider>
            <ContactInfoProvider>
              <PersonalSummaryProvider>
                <ExperienceProvider>
                  <SecondEduProvider>
                    <SkillProvider>
                      <LanguageProvider>
                        <ReferenceProvider>
                          <TertEduProvider>
                            <InterestProvider>
                              <EmployHistoryProvider>
                                <PhotoProvider>
                                  <FirstImpressionProvider>
                                    <CertificateProvider>
                                      <ShareCVProvider>
                                        <UniversalProvider>
                                          <RealTimeProvider>
                                            <AppRoutes />
                                          </RealTimeProvider>
                                        </UniversalProvider>
                                      </ShareCVProvider>
                                    </CertificateProvider>
                                  </FirstImpressionProvider>
                                </PhotoProvider>
                              </EmployHistoryProvider>
                            </InterestProvider>
                          </TertEduProvider>
                        </ReferenceProvider>
                      </LanguageProvider>
                    </SkillProvider>
                  </SecondEduProvider>
                </ExperienceProvider>
              </PersonalSummaryProvider>
            </ContactInfoProvider>
          </PersonalInfoProvider>
        </NavProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
