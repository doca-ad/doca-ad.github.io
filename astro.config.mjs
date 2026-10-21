// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import path from "node:path";

/**
 * Retry image fetches during the build.
 *
 * Every photograph now lives in R2 and is pulled over the network at build time. A single
 * transient failure aborts the whole build — observed in practice: one "fetch failed" and
 * 31 pages produced nothing. Since publishing is a button DOCA press themselves, a flaky
 * build means a flaky publish, so retry rather than making them press it again.
 */
const RETRIES = 4;
const baseFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input?.url ?? "";
  const retryable = url.includes("doca-admin") || url.includes("/media/");
  let lastError;
  for (let attempt = 0; attempt <= (retryable ? RETRIES : 0); attempt++) {
    try {
      const res = await baseFetch(input, init);
      // 5xx is worth another go; 4xx is not going to improve.
      if (res.status >= 500 && attempt < RETRIES && retryable) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastError = err;
      if (attempt === (retryable ? RETRIES : 0)) break;
      const wait = 400 * 2 ** attempt;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[fetch] ${url.slice(-48)} failed (${msg}); retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError;
};

// Tailwind 3 is applied through postcss.config.js, which Astro picks up automatically.
// @astrojs/tailwind peers only up to Astro 5, so it is deliberately not used here.
export default defineConfig({
  site: "https://docastudio.ro",
  integrations: [react(), sitemap()],
  image: {
    // Photos uploaded through the admin live in R2 and are served by the admin Worker.
    // Astro only optimises remote images from hosts listed here.
    remotePatterns: [{ protocol: "https", hostname: "doca-admin.calincapitanu.workers.dev" }],
  },
  // Clean extensionless URLs that match the canonicals and sitemap entries.
  trailingSlash: "never",
  vite: {
    resolve: {
      alias: { "@": path.resolve(process.cwd(), "./src") },
    },
  },
});
