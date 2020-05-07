import crypto from 'crypto';
import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'nookies';
import spotifyApi from 'server/spotify-api';

const O_AUTH_SCOPES: string[] = [
  'user-read-email',
  'user-read-private',
  'user-library-read',
];

/**
 * Redirects to a Spotify authorization page to log the user in.
 * Responses are then handled by the callback API.
 * @param req The request.
 * @param res The response.
 */
export default function (req: NextApiRequest, res: NextApiResponse): void {
  const state = req.cookies.state || crypto.randomBytes(20).toString('hex');

  setCookie({ res }, 'state', state.toString(), {
    maxAge: 3600000,
    secure: true,
    httpOnly: true,
  });

  res
    .writeHead(HttpStatus.MOVED_TEMPORARILY, {
      Location: spotifyApi.createAuthorizeURL(O_AUTH_SCOPES, state),
    })
    .end();
}
