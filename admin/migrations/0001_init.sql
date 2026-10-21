-- Content store for the DOCA admin.
--
-- The site is statically generated, so this is read at BUILD time, not per request:
-- saving in the admin fires a Pages deploy hook and the site rebuilds. That keeps every
-- page prerendered, which is the whole point of the Astro migration.

CREATE TABLE IF NOT EXISTS projects (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  -- Enum key, never free text: the label has to be translatable.
  status          TEXT NOT NULL DEFAULT 'completed',
  type            TEXT NOT NULL,
  location        TEXT NOT NULL,
  year            TEXT NOT NULL,
  description_en  TEXT NOT NULL DEFAULT '',
  description_ro  TEXT NOT NULL DEFAULT '',
  -- Featured on the home sequence, and its position there.
  home            INTEGER NOT NULL DEFAULT 0,
  home_index      INTEGER,
  -- Manual ordering on the projects page; falls back to year DESC.
  sort_index      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_images (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- R2 object key; the build resolves this to a public URL.
  r2_key      TEXT NOT NULL,
  alt_en      TEXT NOT NULL DEFAULT '',
  alt_ro      TEXT NOT NULL DEFAULT '',
  width       INTEGER,
  height      INTEGER,
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_images_project ON project_images(project_id, position);
CREATE INDEX IF NOT EXISTS idx_projects_year  ON projects(year DESC);

-- Append-only record of who changed what. Content lives outside git now, so this is the
-- only history there is.
CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  actor      TEXT NOT NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  TEXT,
  detail     TEXT,
  at         TEXT NOT NULL DEFAULT (datetime('now'))
);
