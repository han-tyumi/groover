export type WebPlayer = { player: Spotify.SpotifyPlayer; deviceId: string };

let webPlayer: WebPlayer;

/**
 * @param accessToken The user's Spotify access token.
 * @returns An object containing the Spotify Web Player and device ID.
 */
export const getPlayer = (accessToken?: string): Promise<WebPlayer> => {
  // return already initialized player
  if (webPlayer) {
    return Promise.resolve(webPlayer);
  }

  // require access token if uninitialized
  if (!accessToken) {
    throw new Error('Access token needed!');
  }

  // create promise resolved with player once ready
  const promise = new Promise<WebPlayer>((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = (): void => {
      // create player
      const player = new Spotify.Player({
        name: 'Groover',
        getOAuthToken: (cb): void => cb(accessToken),
      });

      // reject on errors
      player.addListener('initialization_error', reject);
      player.addListener('authentication_error', reject);
      player.addListener('account_error', reject);

      // connect and resolve when ready
      player.addListener('ready', ({ device_id: deviceId }) => {
        webPlayer = { player, deviceId };
        resolve(webPlayer);
      });
      player.connect();
    };
  });

  // inject SDK
  const script = document.createElement('script');
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  document.body.append(script);

  return promise;
};
