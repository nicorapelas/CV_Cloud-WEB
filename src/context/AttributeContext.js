import _ from 'lodash';
import createDataContext from './createDataContext';
import ngrokApi from '../api/api';

// Reducer
const AttributeReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: action.payload };
    case 'FETCH_SAMPLE':
      return { ...state, attributeSample: action.payload };
    case 'FETCH_STATUS':
      return { ...state, attributeStatus: action.payload, loading: false };
    case 'FETCH_ALL':
      return { ...state, attributes: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        attributes: action.payload,
        attributeStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_ATTRIBUTE_TO_EDIT':
      return { ...state, attributeToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        attributes: action.payload,
        attributeStatusInitFetchDone: false,
        loading: false,
      };
    case 'DELETE':
      return {
        ...state,
        attributes: action.payload,
        attributeStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_ATTRIBUTE_STATUS_INIT_FETCH_DONE':
      return { ...state, attributeStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchAttributeSample = dispatch => async () => {
  try {
    const response = await ngrokApi.get('/api/attribute/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    await ngrokApi.post('/error', { error: error });
    return;
  }
};

const fetchAttributeStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await ngrokApi.get('/api/attribute/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    await ngrokApi.post('/error', { error: error });
    return;
  }
};

const fetchAttributes = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await ngrokApi.get('/api/attribute');
    dispatch({ type: 'FETCH_ALL', payload: response.data });
    return;
  } catch (error) {
    await ngrokApi.post('/error', { error: error });
    return;
  }
};

const createAttribute = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await ngrokApi.post('/api/attribute', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    await ngrokApi.post('/error', { error: error });
    return;
  }
};

const setAttributeToEdit = dispatch => data => {
  dispatch({ type: 'SET_ATTRIBUTE_TO_EDIT', payload: data });
};

const editAttribute = dispatch => async data => {
  const { id, attribute } = data;
  dispatch({ type: 'LOADING' });
  try {
    const response = await ngrokApi.patch(`/api/attribute/${id}`, {
      attribute,
    });
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    await ngrokApi.post('/error', { error: error });
    return;
  }
};

const deleteAttribute = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await ngrokApi.delete(`/api/attribute/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    await ngrokApi.post('/error', { error: error });
    return;
  }
};

const clearAttributeErrors = dispatch => () => {
  dispatch({ type: 'CLEAR_ERRORS', payload: null });
  return;
};

const setAttributeStatusInitFetchDone = dispatch => value => {
  dispatch({ type: 'SET_ATTRIBUTE_STATUS_INIT_FETCH_DONE', payload: value });
};

export const { Context, Provider } = createDataContext(
  AttributeReducer,
  {
    fetchAttributeStatus,
    fetchAttributes,
    fetchAttributeSample,
    createAttribute,
    editAttribute,
    setAttributeToEdit,
    deleteAttribute,
    clearAttributeErrors,
    setAttributeStatusInitFetchDone,
  },
  // Initial state
  {
    attribute: null,
    attributes: null,
    attributeToEdit: null,
    attributeSample: null,
    attributeStatus: null,
    loading: null,
    error: null,
    attributeStatusInitFetchDone: false,
  }
);
