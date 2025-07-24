import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api";
import axios from "axios";

export interface Organization {
  id: string;
  name: string;
  role: string;
}

export interface User {
  avatar_url?: string;
  billing_account_id: string;
  email: string;
  id: string;
  name?: string;
  username: string;
  organizations: Organization[];
  phone?: string;
  token?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  authToken: string | null;
  openCaptchaModal: boolean;
  openRegistrationModal: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  authToken: null,
  openCaptchaModal: false,
  openRegistrationModal: false,
  loading: true,
};

export const fetchUserData = createAsyncThunk<
  { user: User; token: string },
  void,
  { rejectValue: string }
>("auth/fetchUserData", async (_, { rejectWithValue }) => {
  try {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMTkwMDcyMTMxIiwiZXhwIjoyMDY0MzA2ODI5fQ.mNUBO-78M5058To45mJMcw9Jch8Lbq8z5iV0utVQryQ";
    if (!token) {
      return rejectWithValue("Токен не найден");
    }
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await axiosInstance.get<User>("/auth/me");
    return { user: response.data, token };
  } catch (error) {
    localStorage.removeItem("auth_token");

    if (axios.isAxiosError(error) && error.response) {
      return rejectWithValue(error.response.data || "Ошибка");
    }

    return rejectWithValue("Ошибка");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ user: User; token: string }>) {
      const { token, user } = action.payload;
      state.authToken = token;
      state.user = user;
      state.isLoggedIn = true;
      localStorage.setItem("auth_token", token);
    },
    logout(state) {
      localStorage.removeItem("auth_token");
      Object.assign(state, initialState);
      state.loading = false;
    },
    setOpenCaptchaModal(state, action: PayloadAction<boolean>) {
      state.openCaptchaModal = action.payload;
    },
    setOpenRegistrationModal(state, action: PayloadAction<boolean>) {
      state.openRegistrationModal = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
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
