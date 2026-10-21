-- Everything DOCA type is now per-language free text.
--
-- Status was an enum so it could be translated automatically. With a Romanian field for
-- every column that reasoning no longer holds, and free text lets them correct anything
-- without a developer. The old keys are kept as presets in the editor, not as a constraint.
--
-- "Greyed out" is now its own flag rather than being inferred from status, so they can list
-- a finished project as index-only, or show content for a competition entry.

ALTER TABLE projects ADD COLUMN status_en   TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN status_ro   TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN type_en     TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN type_ro     TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN location_en TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN location_ro TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN title_ro    TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN index_only  INTEGER NOT NULL DEFAULT 0;
