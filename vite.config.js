import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const SRC = fileURLToPath(new URL("./src", import.meta.url));

/**
 * Source files import each other from the `src/` root (`import config from
 * "config"`), as jsconfig.json's baseUrl tells editors. This resolves those
 * bare paths for files inside `src/` only, so a dependency that imports a
 * package with the same name ("domain", "config") is never redirected.
 */
const SRC_ROOTS =
  /^(App|components|config|domain|modules|routes|services|store|theme)(\/|$)/;

const srcBaseUrl = () => ({
  name: "src-base-url",
  enforce: "pre",
  resolveId(source, importer, options) {
    if (!importer || !importer.startsWith(SRC) || !SRC_ROOTS.test(source)) return null;
    return this.resolve(path.join(SRC, source), importer, {
      ...options,
      skipSelf: true,
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Tests run west of UTC, so a date-only deadline parsed as UTC midnight (the
  // previous evening locally) fails loudly instead of only for some users.
  if (mode === "test") process.env.TZ = "America/Los_Angeles";
  const port = Number(env.PORT) || 3000;

  return {
    plugins: [srcBaseUrl(), react()],
    server: { port, strictPort: true },
    preview: { port },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["src/setupTests.js"],
      css: false,
      clearMocks: true,
      restoreMocks: true,
    },
  };
});
