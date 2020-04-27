import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { actionTypes } from 'react-redux-firebase';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [actionTypes.LOGIN],
    },
  }),
});

export type AppDispatch = typeof store.dispatch;

export default store;
