import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const PersonalInfoContext = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'FETCH_SAMPLE':
      return { ...state, personalInfoSample: action.payload };
    case 'FETCH_STATUS':
      return {
        ...state,
        personalInfoStatus: action.payload,
        loading: false,
      };
    case 'FETCH_ALL':
      return { ...state, personalInfo: action.payload, loading: false };
    case 'FETCH_VIEW_HEADING':
      return { ...state, viewHeading: action.payload, loading: false };
    case 'FETCH_VIEW_HEADING_SAMPLE':
      return { ...state, viewHeadingSample: action.payload };
    case 'CREATE':
      return {
        ...state,
        personalInfo: action.payload,
        personalInfoStatusFetchDone: false,
        loading: false,
      };
    case 'SET_PERSONAL_INFO_TO_EDIT':
      return { ...state, personalInfoToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        personalInfo: action.payload,
        personalInfoStatusFetchDone: false,
        loading: false,
      };
    case 'DELETE':
      return {
        ...state,
        personalInfo: action.payload,
        personalInfoStatusFetchDone: false,
        loading: false,
      };
    case 'SET_DRIVERS_LICENSE':
      return { ...state, driversLicense: action.payload };
    case 'SET_LICENSE_CODE':
      return { ...state, licenseCode: action.payload };
    case 'SET_PERSONAL_INFO_STATUS_FETCH_DONE':
      return { ...state, personalInfoStatusFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchPersonalInfoSample = dispatch => async () => {
  try {
    const response = await api.get('/api/personal-info/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching personal info sample:', error);
    return;
  }
};

const fetchPersonalInfoStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/personal-info/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching personal info status:', error);
    return;
  }
};

const fetchPersonalInfo = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/personal-info');
    dispatch({ type: 'FETCH_ALL', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching personal info:', error);
    return;
  }
};

const fetchViewHeading = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/personal-info/view-heading');
    dispatch({ type: 'FETCH_VIEW_HEADING', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching view heading:', error);
    return;
  }
};

const fetchViewHeadingSample = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/personal-info/view-heading-sample');
    dispatch({ type: 'FETCH_VIEW_HEADING_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching view heading sample:', error);
    return;
  }
};

const createPersonalInfo = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/personal-info', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating personal info:', error);
    return;
  }
};

const setPersonalInfoToEdit = dispatch => data => {
  dispatch({ type: 'SET_PERSONAL_INFO_TO_EDIT', payload: data });
  return;
};

const editPersonalInfo = dispatch => async (id, formValues) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(`/api/personal-info/${id.id}`, formValues);
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing personal info:', error);
    return;
  }
};

const deletePersonalInfo = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.delete(`/api/personal-info/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting personal info:', error);
    return;
  }
};

const addError = dispatch => error => {
  dispatch({ type: 'ADD_ERROR', payload: error.error });
  return;
};

const clearErrors = dispatch => () => {
  dispatch({ type: 'CLEAR_ERRORS' });
  return;
};

const setDirversLicense = dispatch => data => {
  dispatch({ type: 'SET_DRIVERS_LICENSE', payload: data });
  return;
};

const setLicenseCode = dispatch => data => {
  dispatch({ type: 'SET_LICENSE_CODE', payload: data });
  return;
};

const setPersonalInfoStatusFetchDone = dispatch => value => {
  dispatch({ type: 'SET_PERSONAL_INFO_STATUS_FETCH_DONE', payload: value });
};

export const { Context, Provider } = createDataContext(
  PersonalInfoContext,
  {
    fetchPersonalInfoSample,
    fetchPersonalInfoStatus,
    fetchPersonalInfo,
    fetchViewHeading,
    fetchViewHeadingSample,
    createPersonalInfo,
    setPersonalInfoToEdit,
    editPersonalInfo,
    deletePersonalInfo,
    addError,
    clearErrors,
    setDirversLicense,
    setLicenseCode,
    setPersonalInfoStatusFetchDone,
  },
  // Initial state
  {
    personalInfo: null,
    personalInfoStatus: null,
    personalInfoSample: null,
    viewHeading: null,
    viewHeadingSample: null,
    loading: null,
    error: null,
    driversLicense: null,
    licenseCode: null,
    personalInfoToEdit: null,
    personalInfoStatusFetchDone: false,
  }
);
