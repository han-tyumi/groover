import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LoginState = {
  status?: string;
  error?: string;
};

const initialState: LoginState = {};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<LoginState>): void {
      state = action.payload;
    },
  },
});

export const { setStatus } = loginSlice.actions;

export default loginSlice.reducer;
