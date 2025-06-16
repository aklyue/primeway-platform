import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import organizationReducer from "./slices/organizationSlice";
import tasksFiltersReducer from "./slices/tasksFilterSlice";
import marketplaceReducer from "./slices/marketplaceSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    tasksFilters: tasksFiltersReducer,
    market: marketplaceReducer,
  },
});

export default store;
