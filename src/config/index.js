/**
 * Every environment-dependent value the app reads lives here.
 *
 * Create React App inlines `process.env.REACT_APP_*` at build time, so these
 * are resolved once at module load rather than read from `process.env` all over
 * the component tree.
 */

const rawBaseUrl = (process.env.REACT_APP_API_BASE_URL ?? "").trim();

/** Strip a trailing slash so `${baseUrl}/api/v1/tasks` never doubles up. */
const baseUrl = rawBaseUrl.replace(/\/+$/, "");

const flag = (value, fallback = false) => {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
};

/**
 * Demo mode swaps the HTTP repositories for in-browser ones backed by
 * localStorage. It is the default when no API base URL is configured, which is
 * what makes `npm start` work on a fresh clone with no backend running.
 */
const demoMode = flag(process.env.REACT_APP_DEMO_MODE, baseUrl === "");

export const config = Object.freeze({
  apiBaseUrl: baseUrl,
  demoMode,
  /** Milliseconds before an in-flight request is abandoned. */
  requestTimeoutMs: Number(process.env.REACT_APP_REQUEST_TIMEOUT_MS) || 15000,
  ai: Object.freeze({
    /** "local" is deterministic and needs no credentials. */
    provider: (process.env.REACT_APP_AI_PROVIDER ?? "local").trim() || "local",
    endpoint: (process.env.REACT_APP_AI_ENDPOINT ?? "").trim(),
    apiKey: (process.env.REACT_APP_AI_API_KEY ?? "").trim(),
  }),
  ui: Object.freeze({
    /** Rows rendered per page before the list paginates. */
    pageSize: Number(process.env.REACT_APP_PAGE_SIZE) || 8,
  }),
});

export default config;
