import { readFileSync, writeFileSync } from "node:fs";

/**
 * One-off seed of D1 from data/projects.ts.
 *
 * projects.ts cannot simply be imported here: it imports 85 images, which only Vite/Astro
 * can resolve. Parsing the source is uglier but keeps the seed a standalone node script.
 */
const src = readFileSync("src/data/projects.ts", "utf8");
const roSrc = readFileSync("src/data/translations.ro.ts", "utf8");

// variable name -> asset path, e.g. project1_1 -> 01/1.jpg
const imports = {};
for (const m of src.matchAll(/import\s+(\w+)\s+from\s+"@\/assets\/([^"]+)"/g)) {
  imports[m[1]] = m[2];
}

const ro = {};
for (const m of roSrc.matchAll(/"(project-\d+)":\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)) {
  ro[m[1]] = m[2].replace(/\\"/g, '"');
}

const slugify = (title, type) => {
  const base = title.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const kind = type.split("/")[0].trim().toLowerCase().replace(/\s+/g, "-");
  return `${base}-${kind}`;
};

const esc = (v) => `'${String(v).replace(/'/g, "''")}'`;

// split the array into per-project blocks
const blocks = src.split(/\n\t\{\n/).slice(1);
const rows = [];
let sort = 0;
for (const b of blocks) {
  const get = (k) => (b.match(new RegExp(`${k}: "((?:[^"\\\\]|\\\\.)*)"`)) || [])[1];
  const id = get("id");
  if (!id) continue;
  const title = get("title");
  const type = get("type");
  const desc = (b.match(/description: "((?:[^"\\]|\\.)*)"/) || [])[1] ?? "";
  const home = /home: true/.test(b) ? 1 : 0;
  const homeIndex = (b.match(/homeIndex: (\d+)/) || [])[1] ?? null;
  const imgs = [...b.matchAll(/url: (\w+),/g)].map((m) => imports[m[1]]).filter(Boolean);

  rows.push({
    id, title, type,
    status: get("status") ?? "completed",
    location: get("location"),
    year: get("year"),
    slug: slugify(title, type),
    description_en: desc.replace(/\\"/g, '"'),
    description_ro: ro[id] ?? "",
    home, homeIndex, sort: sort++,
    images: imgs,
  });
}

const sql = [];
sql.push("DELETE FROM project_images;", "DELETE FROM projects;");
for (const r of rows) {
  sql.push(
    `INSERT INTO projects (id,slug,title,status,type,location,year,description_en,description_ro,home,home_index,sort_index) VALUES (` +
      [esc(r.id), esc(r.slug), esc(r.title), esc(r.status), esc(r.type), esc(r.location), esc(r.year),
       esc(r.description_en), esc(r.description_ro), r.home, r.homeIndex ?? "NULL", r.sort].join(",") + ");"
  );
  r.images.forEach((path, i) => {
    // Images still live in the repo until R2 is enabled; "repo:" marks that origin so the
    // build knows to resolve it locally rather than from the bucket.
    sql.push(
      `INSERT INTO project_images (id,project_id,r2_key,position) VALUES (` +
        [esc(`${r.id}-${i + 1}`), esc(r.id), esc(`repo:${path}`), i].join(",") + ");"
    );
  });
}

writeFileSync("admin/migrations/0002_seed.sql", sql.join("\n") + "\n");
console.log(`seeded ${rows.length} projects, ${rows.reduce((n, r) => n + r.images.length, 0)} images`);
console.log("with RO descriptions:", rows.filter((r) => r.description_ro).length);
