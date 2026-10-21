import { readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { join, extname } from "node:path";

/**
 * Drop source images that nothing references.
 *
 * data/projects.ts statically imports every source image so the .astro pages can hand them
 * to getImage(). Vite emits each original alongside the generated AVIFs even though no
 * markup points at them - ~74MB of dead weight in a ~14MB site, uploaded on every deploy
 * and hotlinkable at full resolution.
 *
 * Only ever deletes images. JS chunks import each other by RELATIVE path
 * ("./react.D50QREaB.js"), so they cannot be matched reliably against an `_astro/` prefix;
 * an earlier version of this script pruned them and broke island hydration.
 */
const DIST = "dist";
const ASSETS = join(DIST, "_astro");
const PRUNABLE = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);
const TEXT = /\.(html|js|css|xml|json|txt)$/;

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

// Match bare filenames too, not just `_astro/`-prefixed ones.
const referenced = new Set();
for (const file of walk(DIST)) {
  if (!TEXT.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|gif|webp|avif)/gi)) {
    referenced.add(m[0].split("/").pop());
  }
}

let removed = 0;
let bytes = 0;
for (const file of walk(ASSETS)) {
  const name = file.slice(ASSETS.length + 1);
  if (!PRUNABLE.has(extname(name).toLowerCase())) continue;
  if (referenced.has(name)) continue;
  bytes += statSync(file).size;
  unlinkSync(file);
  removed++;
}

console.log(
  `pruned ${removed} unreferenced image(s), ${(bytes / 1048576).toFixed(1)}MB; ` +
    `${referenced.size} referenced`
);
