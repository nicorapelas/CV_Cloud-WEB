import _ from 'lodash';
import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const SecondEduReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'FETCH_SAMPLE':
      return { ...state, secondEduSample: action.payload };
    case 'FETCH_STATUS':
      return { ...state, secondEduStatus: action.payload, loading: false };
    case 'FETCH_SECOND_EDU':
      return { ...state, secondEdu: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        secondEdu: action.payload,
        secondEduStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_SECOND_EDU_TO_EDIT':
      return { ...state, secondEduToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        secondEdu: action.payload,
        secondEduStatusInitFetchDone: false,
        loading: false,
      };
    case 'DELETE':
      return {
        ...state,
        secondEdu: action.payload,
        secondEduStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_SECOND_EDU_STATUS_INIT_FETCH_DONE':
      return { ...state, secondEduStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchSecondEduSample = dispatch => async () => {
  try {
    const response = await api.get('/api/secondary-education/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching secondary education sample:', error);
    return;
  }
};

const fetchSecondEduStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/secondary-education/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching secondary education status:', error);
    return;
  }
};

const fetchSecondEdu = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/secondary-education');
    dispatch({ type: 'FETCH_SECOND_EDU', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching secondary education:', error);
    return;
  }
};

const createSecondEdu = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/secondary-education', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating secondary education:', error);
    return;
  }
};

const setSecondEduToEdit = dispatch => data => {
  dispatch({ type: 'SET_SECOND_EDU_TO_EDIT', payload: data });
};

const editSecondEdu = dispatch => async (id, formValues) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(
      `/api/secondary-education/${id.id}`,
      formValues
    );
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing secondary education:', error);
    return;
  }
};

const deleteSecondEdu = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.delete(`/api/secondary-education/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting secondary education:', error);
    return;
  }
};

const addError = dispatch => error => {
  dispatch({ type: 'ADD_ERROR', payload: error });
};

const clearSecondEduErrors = dispatch => () => {
  dispatch({ type: 'CLEAR_ERRORS' });
};

const setSecondEduStatusInitFetchDone = dispatch => value => {
  dispatch({ type: 'SET_SECOND_EDU_STATUS_INIT_FETCH_DONE', payload: value });
};

export const { Context, Provider } = createDataContext(
  SecondEduReducer,
  {
    fetchSecondEduSample,
    fetchSecondEduStatus,
    fetchSecondEdu,
    createSecondEdu,
    setSecondEduToEdit,
    editSecondEdu,
    deleteSecondEdu,
    addError,
    clearSecondEduErrors,
    setSecondEduStatusInitFetchDone,
  },
  // Initial state
  {
    secondEdu: null,
    secondEduToEdit: null,
    secondEduSample: null,
    secondEduStatus: null,
    loading: null,
    error: null,
    secondEduStatusInitFetchDone: false,
  }
);
