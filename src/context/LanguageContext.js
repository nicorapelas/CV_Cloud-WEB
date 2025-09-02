import _ from 'lodash';
import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const LanguageReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'FETCH_SAMPLE':
      return { ...state, languageSample: action.payload };
    case 'FETCH_STATUS':
      return { ...state, languageStatus: action.payload, loading: false };
    case 'FETCH_ALL':
      return { ...state, languages: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        languages: action.payload,
        languageStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_LANGUAGE_TO_EDIT':
      return { ...state, languageToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        languages: action.payload,
        languageStatusInitFetchDone: false,
        loading: false,
      };
    case 'DELETE':
      return {
        ...state,
        languages: action.payload,
        languageStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_LANGUAGE_STATUS_INIT_FETCH_DONE':
      return { ...state, languageStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchLanguageSample = dispatch => async () => {
  try {
    const response = await api.get('/api/language/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching language sample:', error);
    return;
  }
};

const fetchLanguageStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/language/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching language status:', error);
    return;
  }
};

const fetchLanguages = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/language');
    dispatch({ type: 'FETCH_ALL', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching languages:', error);
    return;
  }
};

const createLanguage = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/language', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating language:', error);
    return;
  }
};

const setLanguageToEdit = dispatch => data => {
  dispatch({ type: 'SET_LANGUAGE_TO_EDIT', payload: data });
  return;
};

const editLanguage = dispatch => async (id, formValues) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(`/api/language/${id.id}`, formValues);
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing language:', error);
    return;
  }
};

const deleteLanguage = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.delete(`/api/language/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting language:', error);
    return;
  }
};

const addError = dispatch => error => {
  dispatch({ type: 'ADD_ERROR', payload: error });
  return;
};

const clearLanguageErrors = dispatch => async () => {
  dispatch({ type: 'CLEAR_ERRORS' });
  return;
};

const setLanguageStatusInitFetchDone = dispatch => value => {
  dispatch({ type: 'SET_LANGUAGE_STATUS_INIT_FETCH_DONE', payload: value });
};

export const { Context, Provider } = createDataContext(
  LanguageReducer,
  {
    fetchLanguageSample,
    fetchLanguageStatus,
    createLanguage,
    fetchLanguages,
    setLanguageToEdit,
    editLanguage,
    deleteLanguage,
    addError,
    clearLanguageErrors,
    setLanguageStatusInitFetchDone,
  },
  // Initial state
  {
    languages: null,
    languageSample: null,
    languageStatus: null,
    languageToEdit: null,
    loading: null,
    error: null,
    languageStatusInitFetchDone: false,
  }
);
