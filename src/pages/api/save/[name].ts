import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifySession } from 'server/firebase-admin';
import { signIn } from 'server/spotify-api';
import { asString } from 'server/utils';

/**
 * Creates a new collaborative playlist for the user.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { query, body } = req;
  try {
    const uid = await (await verifySession(req)).uid;
    const spotifyApi = await signIn(uid);
    const name = asString(query.name);

    // create playlist
    const playlist = (
      await spotifyApi.createPlaylist(uid, name, {
        description: 'Created with Groover.',
        collaborative: true,
        public: false,
      })
    ).body;

    // add tracks if sent
    if (body instanceof Array) {
      await spotifyApi.addTracksToPlaylist(
        playlist.id,
        (body as SpotifyApi.TrackObjectFull[]).map((t) => t.uri),
      );
    }
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).send(error.toString());
  }
}
