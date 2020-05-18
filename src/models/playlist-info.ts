export interface PlaylistInfo {
  /** The unique identifier for the playlist. */
  id: string;

  /** Name of the playlist. */
  name?: string;

  /** The ID of the user that created this playlist. */
  uid: string;

  /** Tracks belonging to this playlist. */
  tracks?: SpotifyApi.TrackObjectFull[];
}
