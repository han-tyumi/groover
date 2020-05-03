import { combineReducers } from '@reduxjs/toolkit';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';
import loginReducer from './loginSlice';
import playlistReducer from './playlistSlice';

const rootReducer = combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  login: loginReducer,
  playlist: playlistReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
