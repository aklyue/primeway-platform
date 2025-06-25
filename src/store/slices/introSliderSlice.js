import { createSlice } from "@reduxjs/toolkit";

const introSliderSlice = createSlice({
  name: "introSlider",
  initialState: {
    visible: false,
  },
  reducers: {
    showIntroSlider: (state) => {
      state.visible = true;
    },
    hideIntroSlider: (state) => {
      state.visible = false;
    },
  },
});

export const { showIntroSlider, hideIntroSlider } = introSliderSlice.actions;
export default introSliderSlice.reducer;
