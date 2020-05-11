import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { Observable } from 'rxjs';
import { basicConverter } from 'server/firebase';
import { firestore } from 'server/firebase-admin';
import { PlaylistInfo } from 'server/models';
import { signIn } from 'server/spotify-api';
import { asString } from 'server/utils';
import SpotifyWebApi from 'spotify-web-api-node';

/**
 * Returns a new observable for document snapshots.
 * @param doc The Firestore document to observe.
 */
function fromDoc<T>(
  doc: FirebaseFirestore.DocumentReference<T>,
): Observable<FirebaseFirestore.DocumentSnapshot<T>> {
  return new Observable((subscriber) => {
    return doc.onSnapshot(
      (snapshot) => {
        subscriber.next(snapshot);
      },
      (error) => {
        subscriber.error(error);
      },
    );
  });
}

/**
 * Starts playback for a specified playlist.
 * @param playlist The playlist document reference.
 * @param spotifyApi The Spotify API for the user.
 * @param deviceId The device ID to use for playback.
 */
async function play(
  playlist: FirebaseFirestore.DocumentReference<PlaylistInfo>,
  spotifyApi: SpotifyWebApi,
  deviceId?: string,
): Promise<void> {
  fromDoc(playlist).subscribe(async (snapshot) => {
    const tracks = snapshot.get('tracks') as
      | SpotifyApi.TrackObjectFull[]
      | undefined;

    if (tracks) {
      try {
        await spotifyApi.play({
          // eslint-disable-next-line @typescript-eslint/camelcase
          device_id: deviceId,
          uris: tracks.map((t) => t.uri),
        });
      } catch (error) {
        console.error(error);
      }
    }
  });
}

/**
 * Plays the specified playlist.
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
    const playlist = firestore
      .collection('playlist')
      .withConverter(basicConverter<PlaylistInfo>())
      .doc(id);
    if (!(await playlist.get()).exists) {
      throw new Error('Playlist does not exist!');
    }

    // start playback
    play(playlist, spotifyApi, body.deviceId);

    res.json({ success: true });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).send(error.toString());
  }
}
