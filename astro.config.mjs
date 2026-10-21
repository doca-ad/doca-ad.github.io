// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import path from "node:path";

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
