import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const CertificateReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'ADD_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    case 'ADD_UPLOAD_SIGNATURE':
      return { ...state, uploadSignature: action.payload };
    case 'CLEAR_UPLOAD_SIGNATURE':
      return { ...state, uploadSignature: null };
    case 'FETCH_STATUS':
      return { ...state, certificateStatus: action.payload, loading: false };
    case 'FETCH_CERTIFICATES':
      return { ...state, certificates: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        certificates: action.payload,
        certificateStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_CERTIFICATE_TO_EDIT':
      return { ...state, certificateToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        certificates: action.payload,
        certificateStatusInitFetchDone: false,
        loading: false,
      };
    case 'DELETE':
      return {
        ...state,
        certificates: action.payload,
        certificateStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_CERTIFICATE_STATUS_INIT_FETCH_DONE':
      return { ...state, certificateStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchCertificateStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/certificate/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching certificate status:', error);
    return;
  }
};

const fetchCertificates = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/certificate');
    dispatch({ type: 'FETCH_CERTIFICATES', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return;
  }
};

const createCertificate = dispatch => async pdfData => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/certificate', pdfData);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating certificate:', error);
    return;
  }
};

const deleteLargeCertificate = dispatch => async imageFile => {
  try {
    const response = await api.post(
      '/api/photo-service/delete-large-certificate',
      { imageFile }
    );
    return response;
  } catch (error) {
    console.error('Error deleting large certificate:', error);
    return;
  }
};

const setCertificateToEdit = dispatch => data => {
  dispatch({ type: 'SET_CERTIFICATE_TO_EDIT', payload: data });
};

const editCertificate = dispatch => async (id, formValues) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(`/api/certificate/${id}`, formValues);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing certificate:', error);
    return;
  }
};

const deleteCertificate = dispatch => async data => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post(`/api/certificate/delete`, data);
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return;
  }
};

const createUploadSignature = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post(
      '/api/cloudinary/signature-request-no-preset'
    );
    if (response.data.error) {
      dispatch({ type: 'ADD_ERROR', payload: response.data.error });
      return;
    }
    dispatch({ type: 'ADD_UPLOAD_SIGNATURE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating upload signature:', error);
    return;
  }
};

const certificatePhotoUpload = dispatch => async image => {
  try {
    const response = await api.post('/api/certificate/photo-upload', {
      body: JSON.stringify({
        data: image,
      }),
      header: { 'Content-type': 'application/json' },
    });
    return response;
  } catch (error) {
    console.error('Error uploading certificate photo:', error);
    return;
  }
};

const clearUploadSignature = dispatch => () => {
  dispatch({ type: 'CLEAR_UPLOAD_SIGNATURE' });
};

const setCertificateInitStatusFetchDone = dispatch => value => {
  dispatch({ type: 'SET_CERTIFICATE_STATUS_INIT_FETCH_DONE', payload: value });
};

export const { Context, Provider } = createDataContext(
  CertificateReducer,
  {
    fetchCertificateStatus,
    fetchCertificates,
    createCertificate,
    setCertificateToEdit,
    editCertificate,
    deleteCertificate,
    deleteLargeCertificate,
    certificatePhotoUpload,
    createUploadSignature,
    clearUploadSignature,
    setCertificateInitStatusFetchDone,
  },
  // Initial state
  {
    certificate: null,
    certificates: null,
    certificateStatus: null,
    certificateToEdit: null,
    uploadSignature: null,
    loading: null,
    error: null,
    certificateStatusInitFetchDone: false,
  }
);
