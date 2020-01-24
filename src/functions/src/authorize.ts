import * as functions from 'firebase-functions';
import fetch from 'isomorphic-unfetch';
import url from 'url';

/**
 * Returns the redirect uri for the request protocol and forwarded host.
 * @param req The request object.
 */
const getRedirectUri = (req: functions.https.Request) => {
  const pathname = '/api/authorize-success';
  return url.format({
    protocol: req.protocol,
    host: req.get('x-forwarded-host'),
    pathname
  });
};

/**
 * Handles Spotify authorization requests.
 */
export const authorize = functions.https.onRequest(async (req, res) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  if (!client_id) {
    res.redirect('/');
    return;
  }

  const authorizeUrl = new URL('https://accounts.spotify.com/authorize');
  Object.entries({
    client_id,
    response_type: 'code',
    redirect_uri: getRedirectUri(req)
  }).forEach(([key, value]) => authorizeUrl.searchParams.append(key, value));
  res.redirect(authorizeUrl.href);
});

/**
 * Handles successful Spotify authorization requests.
 */
export const authorizeSuccess = functions.https.onRequest(async (req, res) => {
  const {
    query: { code, state, error }
  } = req;

  if (typeof code === 'string') {
    // create encoded authorization string
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    console.log(getRedirectUri(req), req);

    // fetch access token
    const {
      access_token,
      token_type,
      scope,
      expires_in,
      refresh_token
    } = await (
      await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: getRedirectUri(req)
        })
      })
    ).json();

    // fetch user data
    const user = await (
      await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
    ).json();
  }

  // redirect back to app
  res.redirect('/');
});
