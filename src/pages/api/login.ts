import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

import spotifyApi from '../../spotify-api';

const O_AUTH_SCOPES: string[] = [];

export default async function(req: NextApiRequest, res: NextApiResponse) {
  const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
  spotifyApi.setRedirectURI(
    `${req.headers.referer}${spotifyApi.getRedirectURI()}`
  );
  res
    .writeHead(302, {
      Location: spotifyApi.createAuthorizeURL(O_AUTH_SCOPES, state),
      'Set-Cookie': `state=${state.toString()}; Max-Age=3600000; Secure; HttpOnly`
    })
    .end();
}
