import fetch from 'isomorphic-unfetch';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { code, state, error }
  } = req;

  if (typeof code !== 'string') {
    return;
  }

  // create encoded authorization string
  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  // fetch access token
  const { access_token, token_type, scope, expires_in, refresh_token } = await (
    await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `http://${req.headers.host}/api/authorize`
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

  // redirect back to app
  res.writeHead(301, { Location: '/' }).end();
};
