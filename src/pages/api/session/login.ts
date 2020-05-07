import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import nookies from 'nookies';
import { auth } from 'server/firebase-admin';

/** Sessions expire after 5 days. */
export const SESSION_EXPIRES = 60 * 60 * 24 * 5 * 1000;

/** Amount of time allowable between sign in and session creation. */
const SIGN_IN_PERIOD = 5 * 60;

/**
 * Handles a Spotify login callback by creating a new firebase user.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const {
    body: { idToken, csrfToken },
  } = req;

  try {
    // guard against CSRF attacks
    if (csrfToken !== req.cookies.csrfToken) {
      throw new Error('Unauthorized.');
    }

    // only process if the user just signed in
    const decodedIdToken = await auth.verifyIdToken(idToken);
    if (
      new Date().getTime() / 1000 - decodedIdToken.auth_time >=
      SIGN_IN_PERIOD
    ) {
      throw new Error('Recent sign in required!');
    }

    // create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES,
    });

    // set session cookie
    nookies.set({ res }, 'session', sessionCookie, {
      path: '/',
      maxAge: SESSION_EXPIRES,
      httpOnly: true,
      secure: true,
    });
    res.json({ status: 'success' });
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).send(error.toString());
  }
  res.end();
}
