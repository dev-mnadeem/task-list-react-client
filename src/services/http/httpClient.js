import axios from "axios";

import config from "config";

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
});

export const AUTH_TOKEN_KEY = "authToken";

export const readToken = () => {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const writeToken = (token) => {
  try {
    if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    else window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* Storage is unavailable (private mode); the session stays in memory. */
  }
};

/**
 * One axios instance for the whole app.
 *
 * The interceptors attach the token and handle 401/403 in one place, and they
 * always re-reject so a failure reaches the thunk that asked for it rather than
 * resolving to `undefined`.
 */
export const httpClient = axios.create({
  baseURL: config.apiBaseUrl || undefined,
  timeout: config.requestTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((request) => {
  const token = readToken();
  if (token) request.headers.Authorization = token;
  return request;
});

/** Called on 401/403 so the store can clear the session. Set once at boot. */
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN) {
      writeToken(null);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

/** Flatten the several shapes the API uses for errors into one string. */
export const describeError = (error) => {
  const data = error?.response?.data;
  const candidate = data?.message ?? data?.errors ?? data?.error;
  if (Array.isArray(candidate)) return candidate.filter(Boolean).join(", ");
  if (typeof candidate === "string" && candidate) return candidate;
  if (error?.code === "ECONNABORTED") return "The request timed out.";
  if (error?.message) return error.message;
  return "Something went wrong.";
};

export default httpClient;
