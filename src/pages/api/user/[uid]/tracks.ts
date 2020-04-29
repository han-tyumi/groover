import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import firebaseAdmin from '../../../../server/firebase-admin';
import spotifyApi from '../../../../server/spotify-api';

export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { uid } = req.query;
  if (typeof uid !== 'string') {
    res.status(HttpStatus.BAD_REQUEST).end();
    return;
  }
  const db = firebaseAdmin.firestore();
  const dbTask = await db.collection('spotifyToken').doc(uid).get();
  const accessToken = dbTask.get('accessToken');
  const refreshToken = dbTask.get('refreshToken');
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);
  const savedTracks = await spotifyApi.getMySavedTracks();
  res.status(HttpStatus.OK).json(savedTracks.body.items);
}
