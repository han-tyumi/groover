import { combineReducers, Reducer } from '@reduxjs/toolkit';
import { PlaylistInfo } from 'models';
import { firebaseReducer, FirestoreReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';
import loginReducer from './loginSlice';

interface FirestoreReducer<Schema> extends FirestoreReducer.Reducer {
  data: { [T in keyof Schema]?: Record<string, Schema[T] | undefined> };
}

interface Schema {
  playlist: PlaylistInfo;
}

const rootReducer = combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer as Reducer<FirestoreReducer<Schema>>,
  login: loginReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
