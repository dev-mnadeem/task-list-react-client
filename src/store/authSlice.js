import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import authRepository from "services/auth";
import { describeError, writeToken } from "services/http/httpClient";

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }, thunkApi) => {
    try {
      return await authRepository.signIn({ email, password });
    } catch (error) {
      return thunkApi.rejectWithValue(describeError(error));
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({ email, password, firstName, lastName }, thunkApi) => {
    try {
      return await authRepository.signUp({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
    } catch (error) {
      return thunkApi.rejectWithValue(describeError(error));
    }
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  try {
    await authRepository.signOut();
  } finally {
    writeToken(null);
  }
});

const initialState = {
  user: null,
  token: null,
  status: "idle", // idle | loading | ready | failed
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Called by the HTTP layer when the server rejects the session. */
    sessionExpired(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = "Your session expired. Please sign in again.";
    },
  },
  extraReducers: (builder) => {
    const succeed = (state, action) => {
      state.status = "ready";
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      writeToken(action.payload.token);
    };

    builder
      .addCase(signIn.fulfilled, succeed)
      .addCase(signUp.fulfilled, succeed)
      .addCase(signOut.fulfilled, () => ({ ...initialState }))
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload ?? "Authentication failed.";
          state.user = null;
          state.token = null;
        }
      );
  },
});

export const { sessionExpired } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
