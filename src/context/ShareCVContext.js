import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const ShareCVContext = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'CREATE':
      return { ...state, shareCV: action.payload, loading: false };
    default:
      return state;
  }
};

// Actions
const createShareCV = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/share-cv', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return response.data;
  } catch (error) {
    console.error('Error creating share CV:', error);
    dispatch({
      type: 'ADD_ERROR',
      payload: error.response?.data?.error || 'Failed to share CV',
    });
    throw error;
  }
};

const addError = dispatch => error => {
  dispatch({ type: 'ADD_ERROR', payload: error });
};

const clearShareCVErrors = dispatch => () => {
  dispatch({ type: 'CLEAR_ERRORS' });
  return;
};

export const { Context, Provider } = createDataContext(
  ShareCVContext,
  { createShareCV, clearShareCVErrors, addError },
  // Initial state
  { shareCV: null, error: null, loading: null }
);

