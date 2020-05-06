import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { differenceBy, unionBy } from 'lodash';

type PlaylistState = {
  playlist: SpotifyApi.TrackObjectFull[];
};

const initialState: PlaylistState = {
  playlist: [],
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylist(
      state,
      action: PayloadAction<SpotifyApi.TrackObjectFull[]>,
    ): void {
      state.playlist = action.payload;
    },
    addTracks(
      state,
      action: PayloadAction<SpotifyApi.TrackObjectFull[]>,
    ): void {
      state.playlist = unionBy(state.playlist, action.payload, 'id');
    },
    removeTracks(
      state,
      action: PayloadAction<SpotifyApi.TrackObjectFull[]>,
    ): void {
      state.playlist = differenceBy(state.playlist, action.payload, 'id');
    },
  },
});

export const { setPlaylist, addTracks, removeTracks } = playlistSlice.actions;

export default playlistSlice.reducer;
