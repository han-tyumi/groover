import fetch from 'isomorphic-unfetch';
import { sample } from 'lodash';
import { PlaylistInfo } from 'models';
import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { basicConverter, fromDoc, sleep } from 'utils';
import { db } from './firebase';

/**
 * Wrapper around the Spotify Web Player.
 * @todo Move functionality to hook to better support state.
 * Optionally, firestore or redux.
 */
export class Player {
  /** Observable for playback state. */
  readonly state$ = new Observable<Spotify.PlaybackState>((subscriber) => {
    const callback = (s: Spotify.PlaybackState): void => subscriber.next(s);
    this.player.addListener('player_state_changed', callback);
    return (): void =>
      this.player.removeListener('player_state_changed', callback);
  });

  /** The current playback state. */
  private state: Spotify.PlaybackState | null = null;

  /** Whether the player is currently in the process of playing the playlist. */
  private playing = false;

  /** Whether the player is currently waiting for the current track to finish. */
  private waiting = false;

  /** The tracks to be played. */
  private tracks: SpotifyApi.TrackObjectFull[] = [];

  /** The currently playing track. */
  private _current?: SpotifyApi.TrackObjectFull;

  /** Gets the currently playing track. */
  get current(): SpotifyApi.TrackObjectFull | undefined {
    return this._current;
  }

  /**
   * @param player The Spotify Web Player.
   * @param deviceId The Spotify Web Player's device ID.
   * @param playlistId The playlist to play's ID.
   */
  constructor(
    readonly player: Spotify.SpotifyPlayer,
    readonly deviceId: string,
    readonly playlistId: string,
  ) {}

  /**
   * Starts playing the tracks at random in the playlist.
   * Will resume playback if playback was already started.
   */
  async play(): Promise<void> {
    // resume playback if playback previously started
    if (this.playing) {
      this.player.resume();
      return;
    }

    // get playlist document
    const playlist = db
      .collection('playlist')
      .doc(this.playlistId)
      .withConverter(basicConverter<PlaylistInfo>());

    try {
      // watch tracks
      this.tracks = await (await playlist.get()).get('tracks');
      fromDoc(playlist).subscribe(
        (playlist) =>
          (this.tracks = playlist.get(
            'tracks',
          ) as SpotifyApi.TrackObjectFull[]),
      );

      // watch state
      this.state$.subscribe((state) => (this.state = state));

      // enter track playback loop
      while (this.tracks.length) {
        // pick next track randomly
        const next = sample(this.tracks) as SpotifyApi.TrackObjectFull;

        // remove and start playing track
        await Promise.all([
          playlist.update({
            tracks: this.tracks.filter((t) => t.id !== next.id),
          }),
          fetch(`/api/play/${this.deviceId}/${next.uri}`),
        ]);
        this.playing = true;
        this._current = next;

        // wait until track has become previous track
        this.waiting = true;
        while (this.state?.track_window.previous_tracks[0]?.id !== next.id) {
          await sleep(0);
        }
        this.waiting = false;
      }
    } finally {
      this.playing = false;
    }
  }

  /**
   * Skip to the next track.
   */
  next(): void {
    if (this.waiting) {
      this.player.nextTrack();
    }
  }
}

/** @todo This can probably be removed in favor of a singleton. */
let player: Player;

/**
 * @param accessToken The user's Spotify access token.
 * @returns An object containing the Spotify Web Player and device ID.
 */
export const getPlayer = async (
  accessToken: string,
  playlistId: string,
): Promise<Player> => {
  // return already initialized player
  if (player) {
    return player;
  }

  // require access token if uninitialized
  if (!accessToken) {
    throw new Error('Access token needed!');
  }

  // create promise resolved with player once ready
  const promise = new Promise<Player>((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = (): void => {
      // create player
      const p = new Spotify.Player({
        name: 'Groover',
        getOAuthToken: (cb): void => cb(accessToken),
      });

      // reject on errors
      p.addListener('initialization_error', reject);
      p.addListener('authentication_error', reject);
      p.addListener('account_error', reject);

      // connect and resolve when ready
      p.addListener('ready', ({ device_id: deviceId }) => {
        player = new Player(p, deviceId, playlistId);
        resolve(player);
      });
      p.connect();
    };
  });

  // inject SDK
  const script = document.createElement('script');
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  document.body.append(script);

  return promise;
};

/**
 * Plays the specified playlist within a web player.
 * @param accessToken The user's access token.
 * @param playlistId The playlist to play's ID.
 */
export const usePlayer = (
  accessToken: string,
  playlistId: string,
): { player?: Player; state?: Spotify.PlaybackState } => {
  const [player, setPlayer] = useState<Player>();
  const [state, setState] = useState<Spotify.PlaybackState>();

  useEffect(() => {
    (async (): Promise<void> => {
      const player = await getPlayer(accessToken, playlistId);
      setPlayer(player);
      player.state$.subscribe((s) => setState(s));
    })();
  }, []);

  return { player, state };
};
