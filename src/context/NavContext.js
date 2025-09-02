import createDataContext from './createDataContext';

const navReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NAV_TAB_SELECTED':
      return { ...state, navTabSelected: action.payload };
    case 'SET_CV_BIT_SCREEN_SELECTED':
      return { ...state, CVBitScreenSelected: action.payload };
    default:
      return state;
  }
};

const setNavTabSelected = dispatch => tab => {
  dispatch({ type: 'SET_NAV_TAB_SELECTED', payload: tab });
};

const setCVBitScreenSelected = dispatch => screen => {
  dispatch({ type: 'SET_CV_BIT_SCREEN_SELECTED', payload: screen });
};

export const { Context, Provider } = createDataContext(
  navReducer,
  {
    setNavTabSelected,
    setCVBitScreenSelected,
  },
  {
    navTabSelected: 'dashboard',
    CVBitScreenSelected: '',
  }
);
