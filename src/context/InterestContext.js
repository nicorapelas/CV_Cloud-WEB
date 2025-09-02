import _ from 'lodash';
import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const InterestReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'FETCH_SAMPLE':
      return { ...state, interestSample: action.payload };
    case 'FETCH_STATUS':
      return { ...state, interestStatus: action.payload, loading: false };
    case 'FETCH_ALL':
      return { ...state, interests: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        interests: action.payload,
        interestStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_INTEREST_TO_EDIT':
      return { ...state, interestToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        interests: action.payload,
        interestStatusInitFetchDone: false,
        loading: false,
      };
    case 'DELETE':
      return {
        ...state,
        interests: action.payload,
        interestStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_INTEREST_STATUS_INIT_FETCH_DONE':
      return { ...state, interestStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchInterestSample = dispatch => async () => {
  try {
    const response = await api.get('/api/interest/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching interest sample:', error);
    return;
  }
};

const fetchInterestStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/interest/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching interest status:', error);
    return;
  }
};

const fetchInterests = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/interest');
    dispatch({ type: 'FETCH_ALL', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching interests:', error);
    return;
  }
};

const createInterest = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/interest', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating interest:', error);
    return;
  }
};

const setInterestToEdit = dispatch => data => {
  dispatch({ type: 'SET_INTEREST_TO_EDIT', payload: data });
};

const editInterest = dispatch => async data => {
  const { id, interest } = data;
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(`/api/interest/${id}`, { interest });
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing interest:', error);
    return;
  }
};

const deleteInterest = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.delete(`/api/interest/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting interest:', error);
    return;
  }
};

const clearInterestErrors = dispatch => () => {
  dispatch({ type: 'CLEAR_ERRORS' });
  return;
};

const setInterestStatusInitFetchDone = dispatch => value => {
  dispatch({ type: 'SET_INTEREST_STATUS_INIT_FETCH_DONE', payload: value });
};

export const { Context, Provider } = createDataContext(
  InterestReducer,
  {
    fetchInterestStatus,
    fetchInterests,
    fetchInterestSample,
    createInterest,
    editInterest,
    setInterestToEdit,
    deleteInterest,
    clearInterestErrors,
    setInterestStatusInitFetchDone,
  },
  // Initial state
  {
    interests: null,
    interestToEdit: null,
    interestSample: null,
    interestStatus: null,
    loading: null,
    error: null,
    interestStatusInitFetchDone: false,
  }
);
