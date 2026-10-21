-- Saving no longer triggers a build: editing five fields would mean five rebuilds.
-- Deploying is an explicit button, so the admin needs to show whether there is anything
-- waiting to go out.
CREATE TABLE IF NOT EXISTS publish_state (
  target     TEXT PRIMARY KEY,   -- 'staging' | 'production'
  last_at    TEXT,
  last_actor TEXT
);
INSERT OR IGNORE INTO publish_state (target, last_at) VALUES ('staging', NULL), ('production', NULL);
