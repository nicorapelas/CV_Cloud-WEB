import api from '../api/api';
import createDataContext from './createDataContext';

// Reducer
const UniversalReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'CREATE_CV':
      return { ...state, curriculumVitae: action.payload };
    case 'EDIT_CV':
      return { ...state, [action.payload._id]: action.payload };
    case 'FETCH_CV_ID':
      return { ...state, curriculumVitaeID: action.payload, loading: false };
    case 'HIDE_NAV_LINKS':
      return { ...state, hideNaveLink: action.payload };
    default:
      return state;
  }
};

// Actions
const buildCV = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    // Check if user has CV collection
    const curriculumVitaeCollection = await api.get('/api/curriculum-vitae');
    if (curriculumVitaeCollection.data.length < 1) {
      // Create CV collection
      const response = await api.post('/api/curriculum-vitae');
      dispatch({ type: 'CREATE_CV', payload: response.data });
      return response.data;
    } else {
      // Edit users CV
      const { _id } = curriculumVitaeCollection.data[0];
      const response = await api.patch('/api/curriculum-vitae', { id: _id });
      dispatch({ type: 'EDIT_CV', payload: response.data });
      return response.data;
    }
  } catch (error) {
    console.error('Error building CV:', error);
    dispatch({
      type: 'ADD_ERROR',
      payload: error.response?.data?.error || 'Failed to build CV',
    });
    throw error;
  }
};

const fetchCV_ID = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/curriculum-vitae');
    if (response.data && response.data.length > 0) {
      dispatch({ type: 'FETCH_CV_ID', payload: response.data[0]._id });
      return response.data[0]._id;
    } else {
      // No CV found, create one
      const newCV = await api.post('/api/curriculum-vitae');
      dispatch({ type: 'FETCH_CV_ID', payload: newCV.data._id });
      return newCV.data._id;
    }
  } catch (error) {
    console.error('Error fetching CV ID:', error);
    dispatch({
      type: 'ADD_ERROR',
      payload: error.response?.data?.error || 'Failed to fetch CV ID',
    });
    throw error;
  }
};

const clearErrors = dispatch => async () => {
  dispatch({ type: 'CLEAR_ERRORS' });
  return;
};

const toggleHideNavLinks = dispatch => async value => {
  dispatch({ type: 'HIDE_NAV_LINKS', payload: value });
  return;
};

export const { Context, Provider } = createDataContext(
  UniversalReducer,
  {
    buildCV,
    fetchCV_ID,
    clearErrors,
    toggleHideNavLinks,
  },
  // Initial state
  {
    loading: null,
    error: null,
    curriculumVitae: null,
    curriculumVitaeID: null,
    hideNaveLink: false,
  }
);

