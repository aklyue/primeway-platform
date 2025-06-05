import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api";

export const fetchWalletBalance = createAsyncThunk(
  "organization/fetchWalletBalance",
  async (billingAccountId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/billing/${billingAccountId}/balance`
      );
      return response.data.balance;
    } catch (error) {
      return rejectWithValue("Ошибка при получении баланса.");
    }
  }
);

const initialState = {
  organizations: [],
  currentOrganization: null,
  walletBalance: null,
  walletLoading: false,
  walletSilentLoading: false,
  walletError: null,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganizations(state, action) {
      state.organizations = action.payload;
      if (!state.currentOrganization && action.payload.length > 0) {
        state.currentOrganization = action.payload[0];
      }
    },
    setCurrentOrganization(state, action) {
      state.currentOrganization = action.payload;
    },
    switchOrganization(state, action) {
      const org = state.organizations.find((org) => org.id === action.payload);
      if (org) state.currentOrganization = org;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        if (state.walletBalance === null) {
          state.walletLoading = true;
          state.walletSilentLoading = false;
        } else {
          state.walletLoading = false;
          state.walletSilentLoading = true;
        }
        state.walletError = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.walletBalance = action.payload;
        state.walletLoading = false;
        state.walletSilentLoading = false;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.walletError = action.payload;
        state.walletBalance = null;
        state.walletLoading = false;
        state.walletSilentLoading = false;
      });
  },
});

export const { setOrganizations, setCurrentOrganization, switchOrganization } =
  organizationSlice.actions;

export default organizationSlice.reducer;
