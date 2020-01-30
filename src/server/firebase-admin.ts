import admin, { ServiceAccount } from 'firebase-admin';

import serviceAccount from './firebase-service-account.json';

const firebaseAdmin = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
      databaseURL: process.env.DATABASE_URL
    })
  : admin.app();

export default firebaseAdmin;
