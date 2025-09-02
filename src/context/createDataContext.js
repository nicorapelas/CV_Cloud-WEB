import React, { useReducer, createContext, useMemo } from 'react';

const createDataContext = (reducer, actions, defaultValue) => {
  const Context = createContext();

  const Provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, defaultValue);

    const boundActions = useMemo(() => {
      const actionsObj = {};
      for (let key in actions) {
        actionsObj[key] = actions[key](dispatch);
      }
      return actionsObj;
    }, [dispatch]);

    return (
      <Context.Provider value={{ state, ...boundActions }}>
        {children}
      </Context.Provider>
    );
  };

  return { Context, Provider };
};

export default createDataContext;
