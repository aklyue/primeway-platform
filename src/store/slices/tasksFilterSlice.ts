import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  selectedStatus: "",
  selectedJobType: "deploy",
  isScheduledFilter: false,
};

const tasksFilterSlice = createSlice({
  name: "tasksFilters",
  initialState,
  reducers: {
    setSelectedStatus(state, action: PayloadAction<string>) {
      state.selectedStatus = action.payload;
    },
    setSelectedJobType(state, action: PayloadAction<string>) {
      state.selectedJobType = action.payload;
    },
    setIsScheduledFilter(state, action: PayloadAction<boolean>) {
      state.isScheduledFilter = action.payload;
    },
  },
});

export const { setSelectedStatus, setSelectedJobType, setIsScheduledFilter } =
  tasksFilterSlice.actions;

export default tasksFilterSlice.reducer;
