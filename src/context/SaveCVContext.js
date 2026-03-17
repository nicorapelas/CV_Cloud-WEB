import createDataContext from './createDataContext';
import api from '../api/api';

// Reducer
const SaveCVContext = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    case 'SET_CV_TO_SAVE':
      return { ...state, cvToSave: action.payload };
    case 'FETCH_SAVED_CVS':
      return { ...state, savedCVs: action.payload, loading: false };
    case 'FETCH_SAVED_CV_TO_VIEW':
      console.log('📥 SaveCVContext: FETCH_SAVED_CV_TO_VIEW - FULL PAYLOAD:', {
        cvTemplate: action.payload.cvTemplate,
        cvTemplateType: typeof action.payload.cvTemplate,
        hasCVData: !!action.payload.curriculumVitae,
        curriculumVitaeLength: action.payload.curriculumVitae?.length,
        hasSavedCVInfo: !!action.payload.savedCVInfo,
        hasAssignedPhotoUrl: !!action.payload.assignedPhotoUrl,
        fullPayload: action.payload,
        previousTemplate: state.cvTemplateSelected
      });
      const newTemplate = action.payload.cvTemplate || 'template01';
      console.log('📥 SaveCVContext: Setting cvTemplateSelected to:', newTemplate);
      return {
        ...state,
        savedCV_ToView: action.payload.curriculumVitae,
        cvTemplateSelected: newTemplate,
        savedCVInfo: action.payload.savedCVInfo,
        assignedPhotoUrl: action.payload.assignedPhotoUrl || null, // Current assigned photo (priority)
        shareCVAssignedPhotoUrl: action.payload.shareCVAssignedPhotoUrl || null,
        isPreviewMode: action.payload.isPreview || false,
        loading: false,
      };
    case 'FETCH_PUBLIC_CV_PREVIEW':
      console.log('📥 SaveCVContext: FETCH_PUBLIC_CV_PREVIEW', {
        cvTemplate: action.payload.cvTemplate,
        hasCVData: !!action.payload.curriculumVitae,
        hasPublicCVInfo: !!action.payload.publicCVInfo,
        hasAssignedPhotoUrl: !!action.payload.assignedPhotoUrl
      });
      return {
        ...state,
        savedCV_ToView: action.payload.curriculumVitae,
        cvTemplateSelected: action.payload.cvTemplate,
        savedCVInfo: action.payload.publicCVInfo,
        assignedPhotoUrl: action.payload.assignedPhotoUrl || null, // Current assigned photo (priority)
        shareCVAssignedPhotoUrl: action.payload.shareCVAssignedPhotoUrl || null,
        isPreviewMode: true,
        loading: false,
      };
    case 'UPDATE_SAVED_CV_NOTES':
      return {
        ...state,
        savedCVInfo: { ...state.savedCVInfo, notes: action.payload },
      };
    case 'UPDATE_SAVED_CV_RANK':
      return {
        ...state,
        savedCVInfo: { ...state.savedCVInfo, rank: action.payload },
      };
    case 'DELETE_SAVED_CV':
      return {
        ...state,
        savedCVs: state.savedCVs.filter(cv => cv._id !== action.payload),
      };
    case 'CV_UPDATED':
      return {
        ...state,
        savedCVs: state.savedCVs.map(cv =>
          cv._id === action.payload.savedCVId
            ? {
                ...cv,
                hasUnviewedUpdate: true,
                lastUpdatedByOwner: action.payload.updatedAt,
                fullName: action.payload.cvOwnerName || cv.fullName,
              }
            : cv
        ),
      };
    case 'CLEAR_UPDATE_BADGE':
      return {
        ...state,
        savedCVs: state.savedCVs.map(cv =>
          cv._id === action.payload.savedCVId
            ? { ...cv, hasUnviewedUpdate: false }
            : cv
        ),
      };
    default:
      return state;
  }
};

// Actions
const setCVToSave = dispatch => data => {
  dispatch({ type: 'SET_CV_TO_SAVE', payload: data });
};

const clearCVToSave = dispatch => () => {
  dispatch({ type: 'SET_CV_TO_SAVE', payload: null });
};

const fetchSavedCVs = dispatch => async () => {
  dispatch({ type: 'LOADING' });
  const response = await api.get('/hr/saved-cv/saved-cvs');
  dispatch({ type: 'FETCH_SAVED_CVS', payload: response.data });
};

const fetchSavedCVToView = dispatch => async curriculumVitaeID => {
  dispatch({ type: 'LOADING' });
  try {
    const response = await api.get(`/hr/saved-cv/${curriculumVitaeID}`);
    dispatch({ type: 'FETCH_SAVED_CV_TO_VIEW', payload: response.data });
  } catch (error) {
    dispatch({ type: 'STOP_LOADING' });
    console.error('Error fetching saved CV:', error);
    throw error; // Re-throw so calling component can handle it
  }
};

const addNoteToSavedCV = dispatch => async (curriculumVitaeID, content) => {
  const response = await api.put(`/hr/saved-cv/${curriculumVitaeID}/notes`, {
    content,
  });
  dispatch({ type: 'UPDATE_SAVED_CV_NOTES', payload: response.data.notes });
  return response.data;
};

const updateSavedCVRank = dispatch => async (curriculumVitaeID, rank) => {
  const response = await api.put(`/hr/saved-cv/${curriculumVitaeID}/rank`, {
    rank,
  });
  dispatch({ type: 'UPDATE_SAVED_CV_RANK', payload: response.data.rank });
  return response.data;
};

const deleteNoteFromSavedCV = dispatch => async (curriculumVitaeID, noteId) => {
  const response = await api.delete(
    `/hr/saved-cv/${curriculumVitaeID}/notes/${noteId}`
  );
  dispatch({ type: 'UPDATE_SAVED_CV_NOTES', payload: response.data.notes });
  return response.data;
};

const fetchPublicCVPreview = dispatch => async curriculumVitaeID => {
  dispatch({ type: 'LOADING' });
  try {
    console.log('🔍 fetchPublicCVPreview: Requesting preview for:', curriculumVitaeID);
    const response = await api.get(`/api/public-cv/preview/${curriculumVitaeID}`);
    console.log('✅ fetchPublicCVPreview: Success, received data:', {
      hasCurriculumVitae: !!response.data.curriculumVitae,
      cvTemplate: response.data.cvTemplate,
      hasPublicCVInfo: !!response.data.publicCVInfo
    });
    dispatch({ type: 'FETCH_PUBLIC_CV_PREVIEW', payload: response.data });
  } catch (error) {
    console.error('❌ fetchPublicCVPreview: Error details:', {
      curriculumVitaeID,
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data,
      message: error.message
    });
    dispatch({ type: 'STOP_LOADING' });
    throw error;
  }
};

const deleteSavedCV = dispatch => async curriculumVitaeID => {
  const response = await api.delete(`/hr/saved-cv/${curriculumVitaeID}`);
  dispatch({ type: 'DELETE_SAVED_CV', payload: curriculumVitaeID });
  return response.data;
};

const saveSharedCV = dispatch => async data => {
  try {
    const response = await api.post('/hr/saved-cv', data);
    dispatch({ type: 'FETCH_SAVED_CVS', payload: response.data });
    return response.data;
  } catch (error) {
    console.error('Error saving shared CV:', error);
    // If CV is already saved, that's not really an error - just navigate to HR intro
    if (
      error.response?.status === 400 &&
      error.response?.data?.error?.includes('already saved')
    ) {
      console.log('CV already saved, proceeding to HR introduction');
      return { success: true, alreadySaved: true };
    }
    throw error;
  }
};

const handleCVUpdated = dispatch => payload => {
  dispatch({ type: 'CV_UPDATED', payload });
};

const clearUpdateBadge = dispatch => savedCVId => {
  dispatch({ type: 'CLEAR_UPDATE_BADGE', payload: { savedCVId } });
};

export const { Context, Provider } = createDataContext(
  SaveCVContext,
  {
    setCVToSave,
    clearCVToSave,
    fetchSavedCVs,
    fetchSavedCVToView,
    addNoteToSavedCV,
    updateSavedCVRank,
    deleteNoteFromSavedCV,
    fetchPublicCVPreview,
    deleteSavedCV,
    saveSharedCV,
    handleCVUpdated,
    clearUpdateBadge,
  },
  // Initial state
  {
    loading: false,
    cvToSave: null,
    savedCVs: [],
    savedCV_ToView: null,
    cvTemplateSelected: 'template01',
    savedCVInfo: null,
    assignedPhotoUrl: null, // Current assigned photo from server
    shareCVAssignedPhotoUrl: null,
    isPreviewMode: false,
  }
);
