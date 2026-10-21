import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

/**
 * One-off: move the 85 checked-in photographs into R2.
 *
 * Until now their rows carried "repo:<path>" keys, which the admin cannot preview or
 * replace - DOCA could only manage photos they had uploaded themselves. Putting everything
 * in one place makes the admin actually complete.
 */
const src = readFileSync("src/data/projects.ts", "utf8");
const imports = {};
for (const m of src.matchAll(/import\s+(\w+)\s+from\s+"@\/assets\/([^"]+)"/g)) imports[m[1]] = m[2];

const rows = JSON.parse(
  execFileSync("npx", ["wrangler", "d1", "execute", "doca-content", "--remote", "--json",
    "--command", "SELECT id, project_id, r2_key FROM project_images WHERE r2_key LIKE 'repo:%' ORDER BY project_id, position"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
)[0].results;

console.log(`${rows.length} repo-backed images to migrate`);
const updates = [];
let n = 0;
for (const row of rows) {
  const path = row.r2_key.slice(5);
  const key = `${row.project_id}/${path.replace(/\//g, "-")}`;
  execFileSync("npx", ["wrangler", "r2", "object", "put", `doca-media/${key}`,
    "--file", `src/assets/${path}`, "--content-type", "image/jpeg", "--remote"],
    { stdio: "ignore" });
  updates.push(`UPDATE project_images SET r2_key='${key}' WHERE id='${row.id}';`);
  if (++n % 10 === 0) console.log(`  ${n}/${rows.length}`);
}
writeFileSync("admin/migrations/0007_images_to_r2.sql", updates.join("\n") + "\n");
console.log(`uploaded ${n}, wrote ${updates.length} updates`);
