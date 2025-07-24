import { createSlice } from "@reduxjs/toolkit";

interface HintsState {
  restartAt: number | null;
}

const initialState: HintsState = {
  restartAt: null,
};

const hintsSlice = createSlice({
  name: "hints",
  initialState,
  reducers: {
    restartHints(state) {
      state.restartAt = Date.now();
    },
  },
});

export const { restartHints } = hintsSlice.actions;
export default hintsSlice.reducer;
