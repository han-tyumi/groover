import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from 'server/spotify-api';

/**
 * Fetches the user's available devices.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    const spotifyApi = await signIn(req);
    const devices = await (await spotifyApi.getMyDevices()).body.devices;
    res.json(devices);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).send(error.toString());
  }
}
