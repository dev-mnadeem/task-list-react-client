import { createAppStore } from "store";
import { persistStore } from "redux-persist";

import { signIn } from "store/authSlice";

const AUTH_KEY = "persist:task-vault:auth";

beforeEach(() => window.localStorage.clear());

describe("session persistence", () => {
  it("keeps the user and token but never the request status", async () => {
    const store = createAppStore();
    const persistor = persistStore(store);

    await store.dispatch(signIn({ email: "ada@example.com", password: "whatever" }));
    store.dispatch({ type: signIn.pending.type, meta: { requestStatus: "pending" } });
    await persistor.flush();

    const saved = JSON.parse(window.localStorage.getItem(AUTH_KEY));
    expect(JSON.parse(saved.user).email).toBe("ada@example.com");
    expect(saved).toHaveProperty("token");
    expect(saved).not.toHaveProperty("status");
  });
});
