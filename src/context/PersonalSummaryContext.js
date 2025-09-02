import _ from 'lodash';
import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const PersonalSummaryReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'FETCH_SAMPLE':
      return { ...state, personalSummarySample: action.payload };
    case 'FETCH_STATUS':
      return {
        ...state,
        personalSummaryStatus: action.payload,
        loading: false,
      };
    case 'FETCH_ALL':
      return { ...state, personalSummary: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        personalSummary: action.payload,
        personalSummaryStatusFetchDone: false,
        loading: false,
      };
    case 'SET_PERSONAL_SUMMARY_TO_EDIT':
      return { ...state, personalSummaryToEdit: action.payload };
    case 'DELETE':
      return {
        ...state,
        personalSummary: action.payload,
        personalSummaryStatusFetchDone: false,
        loading: false,
      };
    case 'EDIT':
      return {
        ...state,
        personalSummary: action.payload,
        personalSummaryStatusFetchDone: false,
        loading: false,
      };
    case 'SET_PERSONAL_SUMMARY_STATUS_FETCH_DONE':
      return { ...state, personalSummaryStatusFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchPersonalSummarySample = dispatch => async () => {
  try {
    const response = await api.get('/api/personal-summary/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching personal summary sample:', error);
    return;
  }
};

const fetchPersonalSummaryStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/personal-summary/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching personal summary status:', error);
    return;
  }
};

const fetchPersonalSummary = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/personal-summary');
    dispatch({ type: 'FETCH_ALL', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching personal summary:', error);
    return;
  }
};

const createPersonalSummary = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/personal-summary', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating personal summary:', error);
    return;
  }
};

const setPersonalSummaryToEdit = dispatch => data => {
  dispatch({ type: 'SET_PERSONAL_SUMMARY_TO_EDIT', payload: data });
  return;
};

const editPersonalSummary = dispatch => async data => {
  const { id, content } = data;
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(`/api/personal-summary/${id}`, {
      content,
    });
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing personal summary:', error);
    return;
  }
};

const deletePersonalSummary = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.delete(`/api/personal-summary/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting personal summary:', error);
    return;
  }
};

const clearPersonalSummaryErrors = dispatch => async () => {
  dispatch({ type: 'CLEAR_ERRORS' });
  return;
};

const setPersonalSummaryStatusFetchDone = dispatch => value => {
  dispatch({ type: 'SET_PERSONAL_SUMMARY_STATUS_FETCH_DONE', payload: value });
  return;
};

export const { Context, Provider } = createDataContext(
  PersonalSummaryReducer,
  {
    fetchPersonalSummarySample,
    fetchPersonalSummaryStatus,
    fetchPersonalSummary,
    createPersonalSummary,
    setPersonalSummaryToEdit,
    editPersonalSummary,
    deletePersonalSummary,
    clearPersonalSummaryErrors,
    setPersonalSummaryStatusFetchDone,
  },
  // Initial state
  {
    personalSummary: null,
    personalSummarySample: null,
    personalSummaryStatus: null,
    personalSummaryToEdit: null,
    loading: null,
    error: null,
    personalSummaryStatusFetchDone: false,
  }
);
