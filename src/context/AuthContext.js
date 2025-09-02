import api from '../api/api';
import createDataContext from './createDataContext';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    case 'ADD_API_MESSAGE':
      return { ...state, apiMessage: action.payload, loading: false };
    case 'CLEAR_API_MESSAGES':
      return { ...state, apiMessage: '', loading: false };
    case 'ADD_ERROR':
      return { ...state, errorMessage: action.payload, loading: false };
    case 'CLEAR_ERROR_MESSAGE':
      return { ...state, errorMessage: '', loading: false };
    case 'SIGN_IN':
      return { errorMessage: '', token: action.payload, loading: false };
    case 'SIGN_OUT':
      return {
        ...state,
        token: null,
        user: null,
        errorMessage: '',
        loading: false,
      };
    case 'FETCH_USER':
      return { ...state, user: action.payload, loading: false };
    case 'CREATE_USERS_DEVICE':
      return { ...state, usersDevice: action.payload };
    case 'SET_INTRO_AFFILIATE_CODE':
      return { ...state, introAffiliateCode: action.payload };
    case 'ADD_AFFILIATE_INFO':
      return { ...state, affiliateInfo: action.payload, loading: false };
    case 'CLEAR_AFFILIATE_INFO':
      return { ...state, affiliateInfo: action.payload };
    case 'ADD_AFFILIATES':
      return { ...state, affiliates: action.payload, loading: false };
    case 'CLEAR_AFFILIATES':
      return { ...state, affiliates: action.payload };
    case 'ADD_USERS_INFO_CONTENT':
      return { ...state, usersInfoContent: action.payload };
    default:
      return state;
  }
};

const fetchUser = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/auth/user/fetch-user');
    if (response.data.error) {
      // If there's an authentication error, clear the state
      if (
        response.data.error === 'You must be logged in.' ||
        response.data.error === 'no user logged in'
      ) {
        dispatch({ type: 'SIGN_OUT' });
      } else {
        dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      }
      return;
    } else {
      dispatch({ type: 'FETCH_USER', payload: response.data });
      return;
    }
  } catch (error) {
    console.log('Fetch user error:', error);
    // If it's an authentication error, clear the state
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      dispatch({ type: 'SIGN_OUT' });
    }
    return;
  }
};

const tryLocalSignin = dispatch => async () => {
  // For web app, we need to check if user is authenticated via cookie
  // We can do this by making a request to a protected endpoint
  try {
    console.log('tryLocalSignin - Attempting to fetch user');
    const response = await api.get('/auth/user/fetch-user');
    console.log('tryLocalSignin - Response:', response.data);
    if (response.data && !response.data.error) {
      console.log('tryLocalSignin - User authenticated, dispatching actions');
      dispatch({ type: 'SIGN_IN', payload: 'web-authenticated' });
      dispatch({ type: 'FETCH_USER', payload: response.data });
    } else if (response.data && response.data.error) {
      // Handle authentication errors
      if (
        response.data.error === 'You must be logged in.' ||
        response.data.error === 'no user logged in'
      ) {
        console.log('tryLocalSignin - User not authenticated, clearing state');
        dispatch({ type: 'SIGN_OUT' });
      }
    }
  } catch (error) {
    // User is not authenticated, which is fine for initial load
    console.log(
      'tryLocalSignin - User not authenticated on initial load:',
      error
    );
    // If it's an authentication error, clear the state
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      dispatch({ type: 'SIGN_OUT' });
    }
  }
};

const register =
  dispatch =>
  async ({ fullName, email, password, password2, introAffiliateCode }) => {
    dispatch({ type: 'LOADING' });
    try {
      const response = await api.post('/auth/user/register', {
        fullName,
        email,
        password,
        password2,
        affiliatceIntroCode: introAffiliateCode,
      });
      if (response.data.error)
        dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      if (response.data.success)
        dispatch({ type: 'ADD_API_MESSAGE', payload: response.data });
    } catch (err) {
      dispatch({ type: 'STOP_LOADING' });
      dispatch({
        type: 'ADD_ERROR',
        payload: err.response.data,
      });
    }
  };

const signin =
  dispatch =>
  async ({ email, password }) => {
    dispatch({ type: 'LOADING' });
    try {
      console.log('Attempting login with:', { email, password });
      const response = await api.post('/auth/user/login-web', {
        email,
        password,
      });
      console.log('Login response:', response.data);

      if (response.data.error) {
        dispatch({ type: 'ADD_ERROR', payload: response.data.error });
        return;
      }

      // For web login, we don't need to store token in localStorage as it's in HTTP-only cookie
      // But we still need to track authentication state
      dispatch({ type: 'SIGN_IN', payload: 'web-authenticated' });
      // Fetch user data after successful login
      const fetchUserAction = fetchUser(dispatch);
      await fetchUserAction();
    } catch (err) {
      console.log('Login error:', err);
      dispatch({ type: 'STOP_LOADING' });
      dispatch({
        type: 'ADD_ERROR',
        payload: err.response?.data || 'Login failed',
      });
    }
  };

const signout = dispatch => async () => {
  // For web app, we just clear the local state
  // The HTTP-only cookie will be cleared when the session expires
  dispatch({ type: 'SIGN_OUT' });
};

const handleAuthError = dispatch => () => {
  // Clear authentication state when cookie expires or authentication fails
  dispatch({ type: 'SIGN_OUT' });
};

const clearErrorMessage = dispatch => () => {
  dispatch({ type: 'CLEAR_ERROR_MESSAGE' });
};

const clearApiMessage = dispatch => () => {
  dispatch({ type: 'CLEAR_API_MESSAGES' });
};

const createUsersDevice = dispatch => async deviceInfo => {
  try {
    const response = await api.post('/api/devices', deviceInfo);
    dispatch({ type: 'CREATE_USERS_DEVICE', payload: response.data });
  } catch (err) {
    console.log(err);
  }
};

const setIntroAffiliateCode = dispatch => code => {
  dispatch({ type: 'SET_INTRO_AFFILIATE_CODE', payload: code });
};

const addAffiliateInfo = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/affiliate/info');
    dispatch({ type: 'ADD_AFFILIATE_INFO', payload: response.data });
  } catch (err) {
    dispatch({ type: 'STOP_LOADING' });
  }
};

const clearAffiliateInfo = dispatch => () => {
  dispatch({ type: 'CLEAR_AFFILIATE_INFO', payload: null });
};

const addAffiliates = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/affiliate');
    dispatch({ type: 'ADD_AFFILIATES', payload: response.data });
  } catch (err) {
    dispatch({ type: 'STOP_LOADING' });
  }
};

const clearAffiliates = dispatch => () => {
  dispatch({ type: 'CLEAR_AFFILIATES', payload: [] });
};

const addUsersInfoContent = dispatch => content => {
  dispatch({ type: 'ADD_USERS_INFO_CONTENT', payload: content });
};

export const { Context, Provider } = createDataContext(
  authReducer,
  {
    fetchUser,
    tryLocalSignin,
    register,
    signin,
    signout,
    handleAuthError,
    clearErrorMessage,
    clearApiMessage,
    createUsersDevice,
    setIntroAffiliateCode,
    addAffiliateInfo,
    clearAffiliateInfo,
    addAffiliates,
    clearAffiliates,
    addUsersInfoContent,
  },
  {
    token: null,
    user: null,
    errorMessage: '',
    apiMessage: '',
    loading: false,
    usersDevice: null,
    introAffiliateCode: null,
    affiliateInfo: null,
    affiliates: [],
    usersInfoContent: null,
  }
);
