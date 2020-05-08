import cryptoRandomString from 'crypto-random-string';
import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { basicConverter } from 'server/firebase';
import { firestore, verifySession } from 'server/firebase-admin';
import { signIn } from 'server/spotify-api';
import { asString } from 'server/utils';

export interface PlaylistInfo {
  id: string;
  uid: string;
  url: string;
  name: string;
}

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

    const playlist = (
      await spotifyApi.createPlaylist(uid, name, {
        description: 'Created with Groover.',
        collaborative: true,
        public: false,
      })
    ).body;

    const playlists = firestore.collection('playlist');
    const urls = await playlists.listDocuments();
    let url: string;
    do {
      url = cryptoRandomString({ length: 10, type: 'url-safe' });
    } while (urls.find((doc) => doc.id === url));

    const playlistInfo: PlaylistInfo = {
      id: playlist.id,
      uid,
      url,
      name,
    };
    playlists
      .doc(url)
      .withConverter(basicConverter<PlaylistInfo>())
      .set(playlistInfo);

    if (body instanceof Array) {
      await spotifyApi.addTracksToPlaylist(
        playlist.id,
        (body as SpotifyApi.TrackObjectFull[]).map((t) => t.uri),
      );
    }

    res.json(playlistInfo);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).send(error.toString());
  }
}
