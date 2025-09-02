import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  // baseURL: 'https://cv-cloud-api.herokuapp.com', // for production
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

      // Handle authentication errors (401, 403) or specific error messages
      if (
        status === 401 ||
        status === 403 ||
        (data &&
          (data.error === 'You must be logged in.' ||
            data.error === 'no user logged in'))
      ) {
        // Clear any existing authentication state
        localStorage.removeItem('token');

        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          console.log('Authentication failed, redirecting to login');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
