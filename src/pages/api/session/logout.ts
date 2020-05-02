import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie } from 'nookies';
import { auth } from '../../../server/firebase-admin';

/**
 * Logs out the user by destroying their session cookie and revoking their refresh tokens.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const session = req.cookies.session || '';
  destroyCookie({ res }, 'session');
  try {
    const decodedIdToken = await auth.verifySessionCookie(session);
    await auth.revokeRefreshTokens(decodedIdToken.sub);
  } finally {
    res.writeHead(HttpStatus.MOVED_TEMPORARILY, { Location: '/' }).end();
  }
}
