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
import storage from "redux-persist/lib/storage";

import { setUnauthorizedHandler } from "services/http/httpClient";
import authReducer, { sessionExpired } from "store/authSlice";
import tasksReducer from "store/tasksSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: tasksReducer,
});

/**
 * Only the session is persisted. Tasks are re-fetched on mount so a stale
 * board is never shown as if it were live.
 */
const persistConfig = {
  key: "task-vault",
  version: 1,
  storage,
  whitelist: ["auth"],
};

export const createAppStore = (preloadedState) =>
  configureStore({
    reducer: persistReducer(persistConfig, rootReducer),
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
