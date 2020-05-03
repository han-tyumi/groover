import admin from 'firebase-admin';
import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { basicConverter, SpotifyTokens } from '../../server/firebase';
import { auth, firestore } from '../../server/firebase-admin';
import spotifyApi from '../../server/spotify-api';

interface SpotifyUser {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Creates a new user within firebase using the given Spotify account information.
 * @param user The user's information.
 */
async function createUser({
  id,
  displayName,
  photoURL,
  email,
  accessToken,
  refreshToken,
  expiresAt,
}: SpotifyUser): Promise<string> {
  const uid = id;

  const user: admin.auth.CreateRequest = {
    displayName,
    photoURL,
    email,
    emailVerified: true,
  };

  // attempt to update user
  const userTask = auth.updateUser(uid, user).catch((error) => {
    // create new user if not found
    if (error.code === 'auth/user-not-found') {
      return auth.createUser({
        uid,
        ...user,
      });
    }
    throw error;
  });

  // save spotify tokens
  const dbTask = firestore
    .collection('spotifyToken')
    .doc(uid)
    .withConverter(basicConverter<SpotifyTokens>())
    .set({
      accessToken,
      refreshToken,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    });

  // wait for tasks to finish
  await Promise.all([dbTask, userTask]);

  // return custom token
  return auth.createCustomToken(uid);
}

/**
 * Handles a Spotify login callback by creating a new firebase user.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { query, cookies } = req;

  try {
    // validate state cookie
    if (!cookies.state) {
      throw new Error(
        'State cookie not set or expired. Maybe you took too long to authorize. Please try again.',
      );
    } else if (cookies.state !== query.state) {
      throw new Error('State validation failed.');
    }

    // check for authorization code
    if (typeof query.code !== 'string') {
      throw new Error('Authorization code missing.');
    }

    // obtain access and refresh tokens
    const {
      body: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
      },
    } = await spotifyApi.authorizationCodeGrant(query.code);
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    // create user using Spotify account information
    const {
      body: { id, display_name: displayName, email, images },
    } = await spotifyApi.getMe();
    const token = await createUser({
      id,
      displayName: displayName || email,
      photoURL: images ? images[0].url : '',
      email,
      accessToken,
      refreshToken,
      expiresAt,
    });

    // redirect to login page
    res.writeHead(HttpStatus.MOVED_TEMPORARILY, {
      Location: `/login?token=${token}`,
    });
  } catch (error) {
    let status = error.toString();
    if (typeof query.error === 'string') {
      status += `\n${query.error}`;
    }
    res.send(status);
  }
  res.end();
}
