import { createSlice } from "@reduxjs/toolkit";

const hintsSlice = createSlice({
  name: "hints",
  initialState: {
    restartAt: null,
  },
  reducers: {
    restartHints(state) {
      state.restartAt = Date.now();
    },
  },
});

export const { restartHints } = hintsSlice.actions;
export default hintsSlice.reducer;
