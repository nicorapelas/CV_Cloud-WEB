import _ from 'lodash';
import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const TertEduReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'FETCH_SAMPLE':
      return { ...state, tertEduSample: action.payload };
    case 'FETCH_STATUS':
      return { ...state, tertEduStatus: action.payload, loading: false };
    case 'FETCH_TERT_EDUS':
      return { ...state, tertEdus: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        tertEdus: action.payload,
        tertEduStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_TERT_EDU_TO_EDIT':
      return { ...state, tertEduToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        tertEdus: action.payload,
        tertEduStatusInitFetchDone: false,
        loading: false,
      };
    case 'DELETE':
      return {
        ...state,
        tertEdus: action.payload,
        tertEduStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_TERT_EDU_STATUS_INIT_FETCH_DONE':
      return { ...state, tertEduStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchTertEduSample = dispatch => async () => {
  try {
    const response = await api.get('/api/tertiary-education/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching tertiary education sample:', error);
    return;
  }
};

const fetchTertEduStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/tertiary-education/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
  } catch (error) {
    console.error('Error fetching tertiary education status:', error);
  }
};

const fetchTertEdus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/tertiary-education');
    dispatch({ type: 'FETCH_TERT_EDUS', payload: response.data });
  } catch (error) {
    console.error('Error fetching tertiary education:', error);
  }
};

const createTertEdu = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/tertiary-education', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
  } catch (error) {
    console.error('Error creating tertiary education:', error);
  }
};

const setTertEduToEdit = dispatch => data => {
  dispatch({ type: 'SET_TERT_EDU_TO_EDIT', payload: data });
};

const editTertEdu = dispatch => async (id, formValues) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(
      `/api/tertiary-education/${id.id}`,
      formValues
    );
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing tertiary education:', error);
    return;
  }
};

const deleteTertEdu = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.delete(`/api/tertiary-education/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
  } catch (error) {
    console.error('Error deleting tertiary education:', error);
  }
};

const addError = dispatch => error => {
  dispatch({ type: 'ADD_ERROR', payload: error });
};

const clearTertEduErrors = dispatch => () => {
  dispatch({ type: 'CLEAR_ERRORS' });
};

const setTertEduStatusInitFetchDone = dispatch => value => {
  dispatch({ type: 'SET_TERT_EDU_STATUS_INIT_FETCH_DONE', payload: value });
};

export const { Context, Provider } = createDataContext(
  TertEduReducer,
  {
    fetchTertEduSample,
    fetchTertEduStatus,
    fetchTertEdus,
    createTertEdu,
    setTertEduToEdit,
    editTertEdu,
    deleteTertEdu,
    addError,
    clearTertEduErrors,
    setTertEduStatusInitFetchDone,
  },
  // Initial state
  {
    tertEdus: null,
    tertEduSample: null,
    tertEduStatus: null,
    tertEduToEdit: null,
    loading: null,
    error: null,
    tertEduStatusInitFetchDone: false,
  }
);
