import { NextApiRequest, NextApiResponse } from 'next';
import spotifyApi from '../../spotify-api';

export default async function(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!req.cookies.state) {
      throw new Error(
        'State cookie not set or expired. Maybe you took too long to authorize. Please try again.'
      );
    } else if (req.cookies.state !== req.query.state) {
      throw new Error('State validation failed.');
    }

    const {
      query: { code }
    } = req;

    if (typeof code === 'string') {
      const {
        body: { expires_in, access_token, refresh_token }
      } = await spotifyApi.authorizationCodeGrant(code);
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
    }
  } catch (error) {
    res.json({ error: error.toString() });
  }
  res.end();
}
