import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import organizationReducer from "./slices/organizationSlice";
import tasksFiltersReducer from "./slices/tasksFilterSlice";
import marketplaceReducer from "./slices/marketplaceSlice";
import hintsReducer from "./slices/hintsSlice";
import introSliderReducer from "./slices/introSliderSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    tasksFilters: tasksFiltersReducer,
    market: marketplaceReducer,
    hints: hintsReducer,
    introSlider: introSliderReducer,
  },
});

export default store;
