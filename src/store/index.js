import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/es/storage";

import { setUnauthorizedHandler } from "services/http/httpClient";
import authReducer, { sessionExpired } from "store/authSlice";
import tasksReducer from "store/tasksSlice";

/**
 * Only the session itself is persisted. Tasks are re-fetched on mount so a
 * stale board is never shown as if it were live, and request status is left
 * out so a reload mid-request cannot leave the app stuck on "loading".
 */
const authPersistConfig = {
  key: "task-vault:auth",
  version: 1,
  storage,
  whitelist: ["user", "token"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  tasks: tasksReducer,
});

export const createAppStore = (preloadedState) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // redux-persist dispatches non-serialisable actions by design.
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

export const store = createAppStore();
export const persistor = persistStore(store);

// One place where a 401/403 turns into a logged-out store.
setUnauthorizedHandler(() => store.dispatch(sessionExpired()));

export default store;
