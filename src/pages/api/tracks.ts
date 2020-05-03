import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from '../../server/spotify-api';

export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const spotifyApi = await signIn(req);
  const savedTracks = await spotifyApi.getMySavedTracks();
  res.status(HttpStatus.OK).json(savedTracks.body.items);
}
