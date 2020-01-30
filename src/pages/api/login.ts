import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

import spotifyApi from '../../server/spotify-api';

const O_AUTH_SCOPES: string[] = ['user-read-email', 'user-read-private'];

export default async function(req: NextApiRequest, res: NextApiResponse) {
  const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
  res
    .writeHead(302, {
      Location: spotifyApi.createAuthorizeURL(O_AUTH_SCOPES, state),
      'Set-Cookie': `state=${state.toString()}; Max-Age=3600000; Secure; HttpOnly`
    })
    .end();
}
