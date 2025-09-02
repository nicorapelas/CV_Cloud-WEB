import _ from 'lodash';
import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const SkillReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'FETCH_SAMPLE':
      return { ...state, skillSample: action.payload };
    case 'FETCH_STATUS':
      return { ...state, skillStatus: action.payload, loading: false };
    case 'FETCH_ALL':
      return { ...state, skills: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        skills: action.payload,
        skillStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_SKILL_TO_EDIT':
      return { ...state, skillToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        skills: action.payload,
        loading: false,
        skillStatusInitFetchDone: false,
      };
    case 'DELETE':
      return {
        ...state,
        skills: action.payload,
        loading: false,
        skillStatusInitFetchDone: false,
      };
    case 'SET_SKILL_STATUS_INIT_FETCH_DONE':
      return { ...state, skillStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchSkillSample = dispatch => async () => {
  try {
    const response = await api.get('/api/skill/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching skill sample:', error);
    return;
  }
};

const fetchSkillStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/skill/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching skill status:', error);
    return;
  }
};

const fetchSkills = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/skill');
    dispatch({ type: 'FETCH_ALL', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching skills:', error);
    return;
  }
};

const createSkill = dispatch => async formValues => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/skill', formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating skill:', error);
    return;
  }
};

const setSkillToEdit = dispatch => data => {
  dispatch({ type: 'SET_SKILL_TO_EDIT', payload: data });
  return;
};

const editSkill = dispatch => async (id, formValues) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(`/api/skill/${id.id}`, formValues);
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing skill:', error);
    return;
  }
};

const deleteSkill = dispatch => async id => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.delete(`/api/skill/${id}`);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting skill:', error);
    return;
  }
};

const addError = dispatch => error => {
  dispatch({ type: 'ADD_ERROR', payload: error });
  return;
};

const clearSkillErrors = dispatch => async () => {
  dispatch({ type: 'CLEAR_ERRORS' });
  return;
};

const setSkillStatusInitFetchDone = dispatch => value => {
  dispatch({ type: 'SET_SKILL_STATUS_INIT_FETCH_DONE', payload: value });
  return;
};

export const { Context, Provider } = createDataContext(
  SkillReducer,
  {
    fetchSkillSample,
    fetchSkillStatus,
    createSkill,
    fetchSkills,
    setSkillToEdit,
    editSkill,
    deleteSkill,
    addError,
    clearSkillErrors,
    setSkillStatusInitFetchDone,
  },
  // Initial state
  {
    skills: null,
    skillSample: null,
    skillStatus: null,
    skillToEdit: null,
    loading: null,
    error: null,
    skillStatusInitFetchDone: false,
  }
);
