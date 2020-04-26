import { NextApiRequest, NextApiResponse } from 'next';
import firebaseAdmin from '../../server/firebase-admin';
import spotifyApi from '../../server/spotify-api';

async function createUser(
  spotifyId: string,
  displayName: string,
  photoURL: string,
  email: string,
  accessToken: string,
  refreshToken: string
): Promise<string> {
  const uid = `spotify:${spotifyId}`;
  const auth = firebaseAdmin.auth();
  const db = firebaseAdmin.firestore();

  const dbTask = db.collection('spotifyToken').doc(uid).set({
    accessToken,
    refreshToken,
  });

  const user = {
    displayName,
    photoURL,
    email,
    emailVerified: true,
  };

  const userTask = auth.updateUser(uid, user).catch((error) => {
    if (error.code === 'auth/user-not-found') {
      return auth.createUser({
        uid,
        ...user,
      });
    }
    throw error;
  });

  await Promise.all([dbTask, userTask]);

  return auth.createCustomToken(uid);
}

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (!req.cookies.state) {
      throw new Error(
        'State cookie not set or expired. Maybe you took too long to authorize. Please try again.'
      );
    } else if (req.cookies.state !== req.query.state) {
      throw new Error('State validation failed.');
    }

    const {
      query: { code },
    } = req;

    if (typeof code === 'string') {
      const {
        body: { access_token: accessToken, refresh_token: refreshToken },
      } = await spotifyApi.authorizationCodeGrant(code);
      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);

      const {
        body: { id, display_name: displayName, email, images },
      } = await spotifyApi.getMe();
      if (displayName && images) {
        const token = await createUser(
          id,
          displayName,
          images[0].url,
          email,
          accessToken,
          refreshToken
        );
        res.writeHead(302, { Location: `/login?token=${token}` });
      }
    }
  } catch (error) {
    res.json({ error: error.toString() });
  }
  res.end();
}
