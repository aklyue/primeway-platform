import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  marketplace: "jupyter",
};

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState,
  reducers: {
    setMarketplace(state, action) {
      state.marketplace = action.payload;
    },
  },
});

export const { setMarketplace } = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
