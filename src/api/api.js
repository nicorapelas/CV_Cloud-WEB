import axios from 'axios';
import keys from '../config/keys';

const instance = axios.create({
  baseURL: keys.serverUrl,
  withCredentials: true, // This is important for cookies to be sent with requests
});

instance.interceptors.request.use(
  async config => {
    // For web app, authentication is handled via HTTP-only cookies
    // No need to manually add Authorization header
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

// Add response interceptor to handle authentication errors
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Check if the error is due to authentication failure
    if (error.response) {
      const { status, data } = error.response;
      const pathname = window.location.pathname || '';
      const isPublicCvPage =
        /^\/view-applicant-cv\//.test(pathname) ||
        /^\/view-shared-cv\//.test(pathname);
      const isApplicantCvRequest =
        error.config?.url && String(error.config.url).includes('applicant-cv');

      // Handle authentication errors (401, 403) or specific error messages
      if (
        status === 401 ||
        status === 403 ||
        (data &&
          (data.error === 'You must be logged in.' ||
            data.error === 'no user logged in'))
      ) {
        // Don't redirect on public CV view pages (user may be viewing via email link without logging in)
        if (isPublicCvPage) {
          return Promise.reject(error);
        }
        // Don't redirect when applicant-cv API returns 403 (e.g. invalid pin) — show error on page
        if (isApplicantCvRequest) {
          return Promise.reject(error);
        }

        // Clear any existing authentication state
        localStorage.removeItem('token');

        // Only redirect if we're not already on the login page
        if (pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
