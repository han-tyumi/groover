import HttpStatus from 'http-status-codes';
import { PlaylistInfo } from 'models';
import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'server/firebase-admin';
import { signIn } from 'server/spotify-api';
import { asString } from 'server/utils';
import { basicConverter } from 'utils';
import { playing } from './play';

/**
 * Pauses playback.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { query, body } = req;
  try {
    const spotifyApi = await signIn(req);
    const id = asString(query.id);

    // fetch playlist
    const playlist = await firestore
      .collection('playlist')
      .withConverter(basicConverter<PlaylistInfo>())
      .doc(id)
      .get();
    if (!playlist.exists) {
      throw new Error('Playlist does not exist!');
    }

    // stop any future playback
    playing.set(playlist.id, false);

    // pause playback
    // eslint-disable-next-line @typescript-eslint/camelcase
    await spotifyApi.pause({ device_id: body.deviceId });

    res.json({ success: true });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).send(error.toString());
  }
}
