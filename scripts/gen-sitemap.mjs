import { writeFileSync } from "node:fs";

const ORIGIN = "https://docastudio.ro";
/** Keep in sync with the <Route> table in src/App.tsx. */
const ROUTES = [
  { path: "/", priority: "1.0" },
  { path: "/projects", priority: "0.9" },
  { path: "/info", priority: "0.7" },
  { path: "/contact", priority: "0.6" },
];

const today = new Date().toISOString().slice(0, 10);
const body = ROUTES.map(
  (r) =>
    `  <url>\n    <loc>${ORIGIN}${r.path}</loc>\n` +
    `    <lastmod>${today}</lastmod>\n    <priority>${r.priority}</priority>\n  </url>`
).join("\n");

writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
);
console.log(`sitemap.xml: ${ROUTES.length} urls`);
