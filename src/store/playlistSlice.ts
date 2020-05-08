import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { differenceBy, unionBy } from 'lodash';

type PlaylistState = {
  url?: string;
  name: string;
  tracks: SpotifyApi.TrackObjectFull[];
};

const initialState: PlaylistState = {
  url: undefined,
  name: '',
  tracks: [],
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setUrl(state, action: PayloadAction<string>): void {
      state.url = action.payload;
    },
    setName(state, action: PayloadAction<string>): void {
      state.name = action.payload;
    },
    setTracks(
      state,
      action: PayloadAction<SpotifyApi.TrackObjectFull[]>,
    ): void {
      state.tracks = action.payload;
    },
    addTracks(
      state,
      action: PayloadAction<SpotifyApi.TrackObjectFull[]>,
    ): void {
      state.tracks = unionBy(state.tracks, action.payload, 'id');
    },
    removeTracks(
      state,
      action: PayloadAction<SpotifyApi.TrackObjectFull[]>,
    ): void {
      state.tracks = differenceBy(state.tracks, action.payload, 'id');
    },
  },
});

export const {
  setUrl,
  setName,
  setTracks,
  addTracks,
  removeTracks,
} = playlistSlice.actions;

export default playlistSlice.reducer;
