import config from "config";
import httpClient, { writeToken } from "services/http/httpClient";

const DEMO_USER = Object.freeze({
  email: "demo@example.com",
  first_name: "Demo",
  last_name: "User",
});

const DEMO_TOKEN = "demo-session-token";

/**
 * Both implementations resolve to `{ user, token }`.
 *
 * The demo one accepts any well-formed credentials — it exists so the board is
 * reachable without a backend, not to pretend to be authentication.
 */
const apiAuthRepository = {
  async signIn(credentials) {
    const response = await httpClient.post("/login", { user: credentials });
    return {
      user: response?.data?.data?.attributes ?? null,
      token: response?.headers?.authorization ?? null,
    };
  },

  async signUp(credentials) {
    const response = await httpClient.post("/sign_up", { user: credentials });
    return {
      user: response?.data?.data?.attributes ?? null,
      token: response?.headers?.authorization ?? null,
    };
  },

  async signOut() {
    await httpClient.delete("/logout");
  },
};

const demoAuthRepository = {
  async signIn(credentials) {
    return { user: { ...DEMO_USER, email: credentials.email }, token: DEMO_TOKEN };
  },
  async signUp(credentials) {
    return {
      user: {
        ...DEMO_USER,
        email: credentials.email,
        first_name: credentials.first_name ?? DEMO_USER.first_name,
        last_name: credentials.last_name ?? DEMO_USER.last_name,
      },
      token: DEMO_TOKEN,
    };
  },
  async signOut() {
    writeToken(null);
  },
};

export const authRepository = config.demoMode ? demoAuthRepository : apiAuthRepository;

export { DEMO_USER, DEMO_TOKEN };
export default authRepository;
