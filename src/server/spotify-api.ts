import admin from 'firebase-admin';
import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';
import SpotifyWebApi from 'spotify-web-api-node';
import { basicConverter, SpotifyTokens } from './firebase';
import { firestore, verifySession } from './firebase-admin';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

/**
 * @param req The Next API request.
 * @returns Promise containing the Spotify Web API after Spotify user tokens have been retrieved.
 */
export async function signIn(
  req: NextApiRequest | IncomingMessage,
): Promise<SpotifyWebApi>;

/**
 * @param uid The user's user ID.
 * @returns Promise containing the Spotify Web API after Spotify user tokens have been retrieved.
 */
export async function signIn(uid: string): Promise<SpotifyWebApi>;

export async function signIn(
  reqOrUid: NextApiRequest | IncomingMessage | string,
): Promise<SpotifyWebApi> {
  // determine UID
  const uid =
    typeof reqOrUid === 'string'
      ? reqOrUid
      : (await verifySession(reqOrUid)).uid;

  // retrieve Spotify tokens for user
  const doc = firestore
    .collection('spotifyToken')
    .doc(uid)
    .withConverter(basicConverter<SpotifyTokens>());
  const snapshot = await doc.get();
  const data = snapshot.data();
  if (!data) {
    throw new Error('Spotify token data not found!');
  }

  // verify tokens are present
  const { refreshToken } = data;
  let { accessToken, expiresAt } = data;
  if (!(accessToken && refreshToken && expiresAt)) {
    throw new Error('Missing Spotify tokens!');
  }

  // refresh access token if expired
  spotifyApi.setRefreshToken(refreshToken);
  if (new Date() > expiresAt.toDate()) {
    const { body } = await spotifyApi.refreshAccessToken();
    const date = new Date();
    date.setSeconds(date.getSeconds() + body.expires_in);
    expiresAt = admin.firestore.Timestamp.fromDate(date);
    accessToken = body.access_token;

    // update collection
    await doc.update({
      accessToken,
      expiresAt,
    });
  }

  // set access token
  spotifyApi.setAccessToken(accessToken);
  return spotifyApi;
}

export default spotifyApi;
