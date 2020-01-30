import firebase from 'firebase';

import firebaseConfig from './firebase-config';

const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

export default firebaseApp;
