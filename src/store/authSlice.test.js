import { configureStore } from "@reduxjs/toolkit";

import { AUTH_TOKEN_KEY } from "services/http/httpClient";
import authReducer, {
  selectIsAuthenticated,
  sessionExpired,
  signIn,
  signOut,
} from "store/authSlice";

const makeStore = () => configureStore({ reducer: { auth: authReducer } });

beforeEach(() => window.localStorage.clear());

describe("authSlice", () => {
  it("starts signed out", () => {
    const store = makeStore();
    expect(selectIsAuthenticated(store.getState())).toBe(false);
  });

  it("stores the user and writes the token on a successful sign in", async () => {
    // The test environment has no API base URL, so the demo repository is used.
    const store = makeStore();

    await store.dispatch(signIn({ email: "ada@example.com", password: "whatever" }));

    expect(selectIsAuthenticated(store.getState())).toBe(true);
    expect(store.getState().auth.user.email).toBe("ada@example.com");
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeTruthy();
  });

  it("clears the session and the token on sign out", async () => {
    const store = makeStore();
    await store.dispatch(signIn({ email: "ada@example.com", password: "whatever" }));

    await store.dispatch(signOut());

    expect(selectIsAuthenticated(store.getState())).toBe(false);
    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it("drops the session with an explanation when the server revokes it", async () => {
    const store = makeStore();
    await store.dispatch(signIn({ email: "ada@example.com", password: "whatever" }));

    store.dispatch(sessionExpired());

    expect(selectIsAuthenticated(store.getState())).toBe(false);
    expect(store.getState().auth.error).toMatch(/session expired/i);
  });
});
