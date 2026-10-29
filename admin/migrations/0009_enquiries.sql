-- Contact form submissions.
--
-- Stored first and emailed second, deliberately: email can bounce, land in spam, or fail
-- while the sender is still on the page. If an enquiry is in here it cannot be lost, and
-- DOCA can read it where they already sign in.
CREATE TABLE IF NOT EXISTS enquiries (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  locale     TEXT NOT NULL DEFAULT 'en',
  -- Delivery is best-effort and tracked, so a silent failure is visible in the admin.
  mail_state TEXT NOT NULL DEFAULT 'pending',   -- pending | sent | failed | skipped
  mail_error TEXT,
  read_at    TEXT,
  ip_country TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);

-- Cheap per-IP throttle so a public endpoint cannot be hammered into the database.
CREATE TABLE IF NOT EXISTS enquiry_throttle (
  ip_hash  TEXT PRIMARY KEY,
  count    INTEGER NOT NULL DEFAULT 1,
  window_s INTEGER NOT NULL
);
