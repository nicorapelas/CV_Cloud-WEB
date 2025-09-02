import _ from 'lodash';
import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const EmployHistoryReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'FETCH_SAMPLE':
      return { ...state, employHistorySample: action.payload };
    case 'FETCH_STATUS':
      return {
        ...state,
        employHistoryStatus: action.payload,
        loading: false,
      };
    case 'FETCH_EMPLOY_HISTORYS':
      return { ...state, employHistorys: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        employHistorys: action.payload,
        employHistoryStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_EMPLOY_HISTORY_TO_EDIT':
      return { ...state, employHistoryToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        employHistorys: action.payload,
        employHistoryStatusInitFetchDone: false,
        loading: false,
      };
    case 'DELETE':
      return {
        ...state,
        employHistorys: action.payload,
        employHistoryStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_EMPLOY_HISTORY_STATUS_INIT_FETCH_DONE':
      return { ...state, employHistoryStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchEmployHistorySample = dispatch => async () => {
  try {
    const response = await api.get('/api/employment-history/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching employment history sample:', error);
    return;
  }
};

const fetchEmployHistoryStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/employment-history/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching employment history status:', error);
    return;
  }
};

const fetchEmployHistorys = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/employment-history');
    dispatch({ type: 'FETCH_EMPLOY_HISTORYS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching employment historys:', error);
    return;
  }
};

const createEmployHistory = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/employment-history', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating employment history:', error);
    return;
  }
};

const setEmployHistoryToEdit = dispatch => data => {
  dispatch({ type: 'SET_EMPLOY_HISTORY_TO_EDIT', payload: data });
};

const editEmployHistory = dispatch => async (id, formValues) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(
      `/api/employment-history/${id.id}`,
      formValues
    );
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing employment history:', error);
    return;
  }
};

const deleteEmployHistory = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.delete(`/api/employment-history/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting employment history:', error);
    return;
  }
};

const addError = dispatch => error => {
  dispatch({ type: 'ADD_ERROR', payload: error });
};

const clearEmployHistoryErrors = dispatch => () => {
  dispatch({ type: 'CLEAR_ERRORS' });
  return;
};

const setEmployHistoryStatusInitFetchDone = dispatch => value => {
  dispatch({
    type: 'SET_EMPLOY_HISTORY_STATUS_INIT_FETCH_DONE',
    payload: value,
  });
};

export const { Context, Provider } = createDataContext(
  EmployHistoryReducer,
  {
    fetchEmployHistorySample,
    fetchEmployHistoryStatus,
    fetchEmployHistorys,
    createEmployHistory,
    setEmployHistoryToEdit,
    editEmployHistory,
    deleteEmployHistory,
    addError,
    clearEmployHistoryErrors,
    setEmployHistoryStatusInitFetchDone,
  },
  // Initial state
  {
    employHistorys: null,
    employHistorySample: null,
    employHistoryStatus: null,
    employHistoryToEdit: null,
    loading: null,
    employHistoryStatusInitFetchDone: false,
  }
);
