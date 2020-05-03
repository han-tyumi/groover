import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PlaylistState = {
  checked: SpotifyApi.SavedTrackObject[];
  left: SpotifyApi.SavedTrackObject[];
  right: SpotifyApi.SavedTrackObject[];
};

const initialState: PlaylistState = {
  checked: [],
  left: [],
  right: [],
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setChecked(
      state,
      action: PayloadAction<SpotifyApi.SavedTrackObject[]>,
    ): void {
      state.checked = action.payload;
    },
    setLeft(state, action: PayloadAction<SpotifyApi.SavedTrackObject[]>): void {
      state.left = action.payload;
    },
    setRight(
      state,
      action: PayloadAction<SpotifyApi.SavedTrackObject[]>,
    ): void {
      state.right = action.payload;
    },
  },
});

export const { setChecked, setLeft, setRight } = playlistSlice.actions;

export default playlistSlice.reducer;
