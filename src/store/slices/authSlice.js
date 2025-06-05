import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api";

export const fetchUserData = createAsyncThunk(
  "auth/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return rejectWithValue("Токен не найден");
      }
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      const response = await axiosInstance.get("/auth/me");
      return { user: response.data, token };
    } catch (error) {
      localStorage.removeItem("auth_token");
      return rejectWithValue(error.response?.data || "Ошибка");
    }
  }
);

const initialState = {
  isLoggedIn: false,
  user: null,
  authToken: null,
  openCaptchaModal: false,
  openRegistrationModal: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const { token, user } = action.payload;
      state.authToken = token;
      state.user = user;
      state.isLoggedIn = true;
      localStorage.setItem("auth_token", token);
    },
    logout(state, action) {
      localStorage.removeItem("auth_token");
      Object.assign(state, initialState);
      state.loading = false;
    },
    setOpenCaptchaModal(state, action) {
      state.openCaptchaModal = action.payload;
    },
    setOpenRegistrationModal(state, action) {
      state.openRegistrationModal = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.authToken = action.payload.token;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(fetchUserData.rejected, (state) => {
        state.user = null;
        state.authToken = null;
        state.isLoggedIn = false;
        state.loading = false;
      });
  },
});

export const {
  login,
  logout,
  setOpenCaptchaModal,
  setOpenRegistrationModal,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
