import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from 'server/spotify-api';
import { asString } from 'server/utils';

/**
 * Plays the specified playlist.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { query } = req;
  try {
    const spotifyApi = await signIn(req);
    const deviceId = asString(query.deviceId);
    const uri = asString(query.uri);

    // start playback
    // eslint-disable-next-line @typescript-eslint/camelcase
    await spotifyApi.play({ device_id: deviceId, uris: [uri] });
    res.json({ success: true });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).send(error.toString());
  }
}
