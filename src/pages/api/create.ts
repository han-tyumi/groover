import cryptoRandomString from 'crypto-random-string';
import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { basicConverter } from 'server/firebase';
import { firestore, verifySession } from 'server/firebase-admin';
import { PlaylistInfo } from 'server/models';

/**
 * Creates a new collaborative playlist for the user.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    const uid = await (await verifySession(req)).uid;

    // generate new playlist ID
    const playlists = firestore.collection('playlist');
    const ids = await playlists.listDocuments();
    let id: string;
    do {
      id = cryptoRandomString({ length: 10, type: 'url-safe' });
    } while (ids.find((doc) => doc.id === id));

    // store playlist info in firestore
    const playlistInfo: PlaylistInfo = {
      id,
      uid,
    };
    playlists
      .doc(id)
      .withConverter(basicConverter<PlaylistInfo>())
      .set(playlistInfo);

    res.json(playlistInfo);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).send(error.toString());
  }
}
