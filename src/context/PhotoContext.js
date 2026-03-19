import React from 'react';
import createDataContext from './createDataContext';
import api from '../api/api';
import socketService from '../services/socketService';

const normalizeAssignedPhotoPayload = payload => {
  if (typeof payload === 'string') {
    return payload;
  }
  return null;
};

// Reducer
const PhotoReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'PHOTO_ASSIGN_LOADING':
      return { ...state, photoAssignLoading: true };
    case 'ADD_ERROR':
      return { ...state, photoError: action.payload, loading: false };
    case 'FETCH_SAMPLE':
      return { ...state, assignedPhotoUrlSample: action.payload };
    case 'FETCH_STATUS':
      return { ...state, photoStatus: action.payload, loading: false };
    case 'FETCH_PHOTOS':
      return { ...state, photos: action.payload, loading: false };
    case 'CREATE':
      return {
        ...state,
        photos: action.payload,
        photoStatusInitFetchDone: false,
        loading: false,
      };
    case 'ADD_UPLOAD_SIGNATURE':
      return { ...state, uploadSignature: action.payload };
    case 'CLEAR_UPLOAD_SIGNATURE':
      return { ...state, uploadSignature: action.payload };
    case 'ASSIGN_PHOTO':
      return { ...state, photos: action.payload, photoStatusInitFetchDone: false, photoAssignLoading: false };
    case 'SET_ASSIGNED_PHOTO_ID':
      return { ...state, assignedPhotoId: action.payload };
    case 'FETCH_ASSIGNED_PHOTO':
      return { ...state, assignedPhotoUrl: action.payload };
    case 'DELETE':
      return {
        ...state,
        photos: action.payload,
        photoStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_PHOTO_TO_EDIT':
      return { ...state, photoToEdit: action.payload };
    case 'EDIT':
      return {
        ...state,
        photos: action.payload,
        photoStatusInitFetchDone: false,
        loading: false,
      };
    case 'SET_PHOTO_STATUS_INIT_FETCH_DONE':
      return { ...state, photoStatusInitFetchDone: action.payload };
    default:
      return state;
  }
};

// Actions
const fetchPhotoSample = dispatch => async () => {
  try {
    const response = await api.get('/api/photo/sample');
    dispatch({ type: 'FETCH_SAMPLE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching photo sample:', error);
    return;
  }
};

const fetchPhotoStatus = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/photo/status');
    dispatch({ type: 'FETCH_STATUS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching photo status:', error);
    return;
  }
};

const createPhoto = dispatch => async imageData => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post('/api/photo', imageData);
    dispatch({ type: 'CREATE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error creating photo:', error);
    return;
  }
};

const createUploadSignature = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post(
      '/api/cloudinary/signature-request-photo-preset'
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

const clearUploadSignature = dispatch => () => {
  dispatch({ type: 'CLEAR_UPLOAD_SIGNATURE', payload: null });
};

const fetchAssignedPhoto = dispatch => async (forceRefresh = false) => {
  try {
    // Add cache-busting query parameter if force refresh
    const url = forceRefresh 
      ? `/api/photo/assigned?t=${Date.now()}`
      : '/api/photo/assigned';
    const response = await api.get(url);
    const normalizedAssignedPhoto = normalizeAssignedPhotoPayload(response.data);
    dispatch({ type: 'FETCH_ASSIGNED_PHOTO', payload: normalizedAssignedPhoto });
    return normalizedAssignedPhoto;
  } catch (error) {
    console.error('Error fetching assigned photo:', error);
    return null;
  }
};

const fetchPhotos = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get('/api/photo');
    dispatch({ type: 'FETCH_PHOTOS', payload: response.data });
    return;
  } catch (error) {
    console.error('Error fetching photos:', error);
    return;
  }
};

const deleteLargePhoto = dispatch => async imageFile => {
  try {
    api.post('/api/photo-service/delete-large-photo', { imageFile });
    return;
  } catch (error) {
    console.error('Error deleting large photo:', error);
    return;
  }
};

const deleteSmallPhoto = dispatch => async imageFile => {
  try {
    api.post('/api/photo-service/delete-photo', { imageFile });
    return;
  } catch (error) {
    console.error('Error deleting small photo:', error);
    return;
  }
};

const deletePhoto = dispatch => async data => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.post(`/api/photo/delete`, data);
    dispatch({ type: 'DELETE', payload: response.data });
    return;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return;
  }
};

const assignPhoto = dispatch => async id => {
  dispatch({ type: 'PHOTO_ASSIGN_LOADING' });
  try {
    const response = await api.post('/api/photo/assign-photo', { id });
    dispatch({ type: 'ASSIGN_PHOTO', payload: response.data });

    // Also fetch the updated assigned photo URL
    const assignedResponse = await api.get('/api/photo/assigned');
    dispatch({
      type: 'FETCH_ASSIGNED_PHOTO',
      payload: normalizeAssignedPhotoPayload(assignedResponse.data),
    });

    return;
  } catch (error) {
    console.error('Error assigning photo:', error);
    return;
  }
};

const setAssignedPhotoId = dispatch => value => {
  dispatch({ type: 'SET_ASSIGNED_PHOTO_ID', payload: value });
};

const setPhotoToEdit = dispatch => data => {
  dispatch({ type: 'SET_PHOTO_TO_EDIT', payload: data });
};

const editPhoto = dispatch => async (id, formValues) => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.patch(`/api/photo/${id}`, formValues);
    dispatch({ type: 'EDIT', payload: response.data });
    return;
  } catch (error) {
    console.error('Error editing photo:', error);
    return;
  }
};

const setPhotoStatusInitFetchDone = dispatch => value => {
  dispatch({ type: 'SET_PHOTO_STATUS_INIT_FETCH_DONE', payload: value });
};

const { Context, Provider: BaseProvider } = createDataContext(
  PhotoReducer,
  {
    fetchPhotoSample,
    fetchPhotoStatus,
    fetchAssignedPhoto,
    fetchPhotos,
    createPhoto,
    createUploadSignature,
    clearUploadSignature,
    setPhotoToEdit,
    editPhoto,
    deleteLargePhoto,
    deleteSmallPhoto,
    deletePhoto,
    assignPhoto,
    setAssignedPhotoId,
    setPhotoStatusInitFetchDone,
  },
  // Initial state
  {
    photo: null,
    photos: null,
    assignedPhotoUrlSample: null,
    photoStatus: null,
    uploadSignature: null,
    loading: null,
    photoToEdit: null,
    photoError: null,
    assignedPhotoId: null,
    assignedPhotoUrl: null,
    photoStatusInitFetchDone: false,
  }
);

// Enhanced Provider with periodic refresh and Socket.io sync
const Provider = ({ children }) => {
  const [state, dispatch] = React.useReducer(PhotoReducer, {
    photo: null,
    photos: null,
    assignedPhotoUrlSample: null,
    photoStatus: null,
    uploadSignature: null,
    loading: null,
    photoToEdit: null,
    photoError: null,
    assignedPhotoId: null,
    assignedPhotoUrl: null,
    photoStatusInitFetchDone: false,
  });

  const boundActions = React.useMemo(() => {
    return {
      fetchPhotoSample: fetchPhotoSample(dispatch),
      fetchPhotoStatus: fetchPhotoStatus(dispatch),
      fetchAssignedPhoto: fetchAssignedPhoto(dispatch),
      fetchPhotos: fetchPhotos(dispatch),
      createPhoto: createPhoto(dispatch),
      createUploadSignature: createUploadSignature(dispatch),
      clearUploadSignature: clearUploadSignature(dispatch),
      setPhotoToEdit: setPhotoToEdit(dispatch),
      editPhoto: editPhoto(dispatch),
      deleteLargePhoto: deleteLargePhoto(dispatch),
      deleteSmallPhoto: deleteSmallPhoto(dispatch),
      deletePhoto: deletePhoto(dispatch),
      assignPhoto: assignPhoto(dispatch),
      setAssignedPhotoId: setAssignedPhotoId(dispatch),
      setPhotoStatusInitFetchDone: setPhotoStatusInitFetchDone(dispatch),
    };
  }, []);

  // Periodic refresh: Refresh assigned photo every 5 minutes
  React.useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (boundActions.fetchAssignedPhoto) {
        boundActions.fetchAssignedPhoto(true); // Force refresh with cache-busting
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [boundActions]);

  // Refresh on window focus (user returns to tab)
  React.useEffect(() => {
    const handleFocus = () => {
      if (boundActions.fetchAssignedPhoto) {
        boundActions.fetchAssignedPhoto(true); // Force refresh
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [boundActions]);

  // Socket.io real-time sync for photo updates
  React.useEffect(() => {
    const handleDataUpdate = (data) => {
      // Check if this is a photo-related update
      if (data && data.dataType === 'photo') {
        // Refresh assigned photo when photo is created, assigned, or deleted
        if (['created', 'assigned', 'deleted', 'updated'].includes(data.action)) {
          if (boundActions.fetchAssignedPhoto) {
            boundActions.fetchAssignedPhoto(true); // Force refresh
          }
        }
      }
    };

    socketService.addEventListener('data-updated', handleDataUpdate);

    return () => {
      socketService.removeEventListener('data-updated', handleDataUpdate);
    };
  }, [boundActions]);

  const value = React.useMemo(
    () => ({ state, ...boundActions }),
    [state, boundActions]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export { Context, Provider };
