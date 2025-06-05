import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import organizationReducer from "./slices/organizationSlice";
import tasksFiltersReducer from "./slices/tasksFilterSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    tasksFilters: tasksFiltersReducer,
  },
});

export default store;
