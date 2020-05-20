import fetch from 'isomorphic-unfetch';
import { sample } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFirestore, useFirestoreConnect } from 'react-redux-firebase';
import { RootState } from 'store/rootReducer';

type SpotifyPlayer = { player: Spotify.SpotifyPlayer; deviceId: string };

let player: SpotifyPlayer;

/**
 * @param accessToken The user's Spotify access token.
 * @returns An object containing the Spotify Web Player and device ID.
 */
export const getPlayer = async (
  accessToken: string,
): Promise<SpotifyPlayer> => {
  // return already initialized player
  if (player) {
    return player;
  }

  // require access token if uninitialized
  if (!accessToken) {
    throw new Error('Access token needed!');
  }

  // create promise resolved with player once ready
  const promise = new Promise<SpotifyPlayer>((resolve, reject) => {
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
        player = { player: p, deviceId };
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

interface PlayerState {
  /** The current playback state. */
  state?: Spotify.PlaybackState;

  /** The currently playing track. */
  current?: SpotifyApi.TrackObjectFull;

  /** The tracks currently in the playlist. */
  tracks?: SpotifyApi.TrackObjectFull[];

  /** Whether the player is currently in the process of playing the playlist. */
  playing: boolean;

  /** Whether the player is currently busy. */
  busy: boolean;

  /**
   * Starts playing the tracks at random in the playlist.
   * Will resume playback if playback was already started.
   */
  play: () => void;

  /**
   * Pause playback.
   */
  pause: () => void;

  /**
   * Skip to the next track.
   */
  next: () => Promise<void>;
}

/**
 * Handles playing the specified playlist using the Spotify Web Player SDK.
 * @param accessToken The user's access token.
 * @param playlistId The playlist to play's ID.
 */
export function usePlayer(
  accessToken: string,
  playlistId: string,
): PlayerState {
  const [deviceId, setDeviceId] = useState<string>();
  const [player, setPlayer] = useState<Spotify.SpotifyPlayer>();
  const [state, setState] = useState<Spotify.PlaybackState>();
  const [current, setCurrent] = useState<SpotifyApi.TrackObjectFull>();
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);

  useFirestoreConnect({
    collection: 'playlist',
    doc: playlistId,
  });
  const tracks = useSelector(
    (state: RootState) => state.firestore.data.playlist?.[playlistId]?.tracks,
  );
  const firestore = useFirestore();

  // effect to setup the player and listen for state changes
  useEffect(() => {
    const cb = (s: Spotify.PlaybackState): void => setState(s);

    (async (): Promise<void> => {
      const { player, deviceId } = await getPlayer(accessToken);
      setDeviceId(deviceId);
      setPlayer(player);
      player.addListener('player_state_changed', cb);
    })();

    return (): void => {
      player?.removeListener('player_state_changed', cb);
      player?.disconnect();
    };
  }, []);

  const next = useCallback(async () => {
    // don't switch if already busy or we are not playing
    if (busy || !playing) {
      return;
    }

    // stop playing if we have run out of tracks
    if (!tracks?.length) {
      setPlaying(false);
      return;
    }

    // set player busy while switching tracks
    setBusy(true);

    // pick next track randomly
    const next = sample(tracks) as SpotifyApi.TrackObjectFull;

    // remove and start playing track
    await Promise.all([
      firestore
        .collection('playlist')
        .doc(playlistId)
        .update({
          tracks: tracks?.filter((t) => t.id !== next.id),
        }),
      fetch(`/api/play/${deviceId}/${next.uri}`),
    ]);
    setCurrent(next);
    setBusy(false);
  }, [busy, playing, tracks]);

  // play next song when playback has started, otherwise reset current track
  useEffect(() => {
    if (playing) {
      next();
    } else {
      setCurrent(undefined);
    }
  }, [playing]);

  // watches for changes in playback state in order to start playing the next
  // track when necessary
  useEffect(() => {
    if (
      playing &&
      !busy &&
      state?.track_window.previous_tracks[0]?.id === current?.id
    ) {
      next();
    }
  }, [state]);

  const play = useCallback(() => {
    // require player to be defined
    if (!player) {
      return;
    }

    // resume playback if playback previously started
    if (playing) {
      player.resume();
      return;
    }

    // start playing
    setPlaying(true);
  }, [player, playing]);

  const pause = (): void => {
    player?.pause();
  };

  return {
    state,
    current,
    tracks,
    playing,
    busy,
    play,
    pause,
    next,
  };
}
