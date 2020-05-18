import HttpStatus from 'http-status-codes';
import { sample } from 'lodash';
import { PlaylistInfo } from 'models';
import { NextApiRequest, NextApiResponse } from 'next';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { firestore } from 'server/firebase-admin';
import { signIn } from 'server/spotify-api';
import { asString } from 'server/utils';
import SpotifyWebApi from 'spotify-web-api-node';
import { basicConverter, sleep } from 'utils';

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

export const playing = new Map<string, boolean>();

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
  const id = playlist.id;
  if (playing.get(id)) {
    return;
  }

  playing.set(id, true);

  try {
    let tracks = (await playlist.get()).get('tracks') as
      | SpotifyApi.TrackObjectFull[]
      | undefined;

    fromDoc(playlist)
      .pipe(takeWhile(() => !!tracks?.length))
      .subscribe((snapshot) => (tracks = snapshot.get('tracks')));

    while (tracks?.length && playing.get(id)) {
      const next = sample(tracks) as SpotifyApi.TrackObjectFull;

      console.log(`Playing ${next.name}`);
      await Promise.all([
        playlist.update({
          tracks: tracks.filter((t) => t.id !== next.id),
        }),

        // eslint-disable-next-line @typescript-eslint/camelcase
        spotifyApi.play({ device_id: deviceId, uris: [next.uri] }),
      ]);

      await sleep(next.duration_ms);
    }
  } finally {
    playing.set(id, false);
  }
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
