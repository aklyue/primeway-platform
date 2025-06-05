import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedStatus: "",
  selectedJobType: "deploy",
  isScheduledFilter: false,
};

const tasksFilterSlice = createSlice({
  name: "tasksFilters",
  initialState,
  reducers: {
    setSelectedStatus(state, action) {
      state.selectedStatus = action.payload;
    },
    setSelectedJobType(state, action) {
      state.selectedJobType = action.payload;
    },
    setIsScheduledFilter(state, action) {
      state.isScheduledFilter = action.payload;
    },
  },
});

export const { setSelectedStatus, setSelectedJobType, setIsScheduledFilter } =
  tasksFilterSlice.actions;

export default tasksFilterSlice.reducer;
