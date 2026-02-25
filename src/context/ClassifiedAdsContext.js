import React, { useEffect, useContext } from 'react';
import api from '../api/api';
import createDataContext from './createDataContext';
import socketService from '../services/socketService';

const ClassifiedAdsReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_SETTINGS':
      return {
        ...state,
        classifiedAdsActive: action.payload.classifiedAdsActive !== false,
        settingsLoaded: true,
      };
    case 'SET_CLASSIFIED_ADS_ACTIVE':
      return { ...state, classifiedAdsActive: action.payload };
    default:
      return state;
  }
};

const fetchClassifiedAdsSettings = (dispatch) => async () => {
  try {
    const response = await api.get('/api/system-settings');
    dispatch({
      type: 'FETCH_SETTINGS',
      payload: {
        classifiedAdsActive: response.data.classifiedAdsActive !== false,
      },
    });
  } catch (error) {
    console.error('Error fetching classified ads settings:', error);
    dispatch({
      type: 'FETCH_SETTINGS',
      payload: { classifiedAdsActive: true },
    });
  }
};

const setClassifiedAdsActive = (dispatch) => (value) => {
  dispatch({ type: 'SET_CLASSIFIED_ADS_ACTIVE', payload: value });
};

const { Provider: BaseProvider, Context } = createDataContext(
  ClassifiedAdsReducer,
  { fetchClassifiedAdsSettings, setClassifiedAdsActive },
  { classifiedAdsActive: true, settingsLoaded: false }
);

export { Context };

const ClassifiedAdsSocketListener = ({ children }) => {
  const { setClassifiedAdsActive: setActive } = useContext(Context);

  useEffect(() => {
    const handleSystemSettingsUpdate = (data) => {
      if (typeof data.classifiedAdsActive === 'boolean') {
        setActive(data.classifiedAdsActive);
      }
    };
    socketService.addEventListener('system-settings-updated', handleSystemSettingsUpdate);
    return () => {
      socketService.removeEventListener('system-settings-updated', handleSystemSettingsUpdate);
    };
  }, [setActive]);

  return <>{children}</>;
};

export const Provider = ({ children }) => {
  return (
    <BaseProvider>
      <ClassifiedAdsSocketListener>{children}</ClassifiedAdsSocketListener>
    </BaseProvider>
  );
};
