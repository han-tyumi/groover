import admin from 'firebase-admin';
import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';
import { parseCookies } from 'nookies';
import { UserInfo } from './models';

const firebaseAdmin = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
  : admin.app();
export const firestore = firebaseAdmin.firestore();
export const auth = firebaseAdmin.auth();

/**
 * Verifies the user's session.
 * Will throw an error if revoked or invalid.
 * @param req The request.
 * @returns The decoded ID token.
 */
export async function verifySession(
  req: NextApiRequest | IncomingMessage,
): Promise<admin.auth.DecodedIdToken> {
  // verify the session cookie and if the user's session was revoked
  const { session } = parseCookies({ req });
  return await auth.verifySessionCookie(session, true);
}

/**
 * @param uid The user's ID.
 * @returns A Next.js serializable User object.
 */
export async function getUser(uid: string): Promise<UserInfo> {
  const { displayName, email, photoURL } = await auth.getUser(uid);
  return {
    uid,
    displayName: displayName || null,
    email: email || null,
    photoURL: photoURL || null,
  };
}

export default firebaseAdmin;
