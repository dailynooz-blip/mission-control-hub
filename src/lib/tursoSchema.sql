-- ============================================================
-- OpenClaw Agent State Layer — Turso / SQLite Schema
-- Run this once via: turso db shell <your-db> < tursoSchema.sql
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── 1. Agents ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id              TEXT PRIMARY KEY,          -- e.g. "max", "jordan"
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('LEAD','SPC','INT')),
  status          TEXT NOT NULL DEFAULT 'idle'
                    CHECK (status IN ('working','idle','waiting')),
  emoji           TEXT NOT NULL DEFAULT '🤖',
  about           TEXT,
  skills          TEXT,                      -- JSON array string
  status_reason   TEXT,
  since_ago       TEXT,
  model           TEXT DEFAULT 'gpt-4o',
  monthly_token_cap INTEGER DEFAULT 500000,
  tokens_used_month INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- ── 2. Goals ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  owner_agent_id  TEXT REFERENCES agents(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','paused','completed','cancelled')),
  priority        INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1,2,3)),
  due_date        TEXT,                      -- ISO date
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- ── 3. Tasks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id                TEXT PRIMARY KEY,
  goal_id           TEXT REFERENCES goals(id) ON DELETE SET NULL,
  parent_task_id    TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN (
                        'inbox','pending','assigned','in-progress',
                        'review','done','waiting','failed','cancelled'
                      )),
  priority          INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1,2,3)),
  depth             INTEGER NOT NULL DEFAULT 0,  -- guardrail: depth <= 3
  subtask_count     INTEGER NOT NULL DEFAULT 0,  -- guardrail: max 5
  retry_count       INTEGER NOT NULL DEFAULT 0,  -- guardrail: max 2
  tags              TEXT DEFAULT '[]',            -- JSON array
  budget_tokens     INTEGER DEFAULT 10000,
  tokens_consumed   INTEGER DEFAULT 0,
  error_message     TEXT,
  days_ago          INTEGER DEFAULT 0,
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now')),

  -- Guardrail constraints enforced at DB level
  CHECK (depth <= 3),
  CHECK (subtask_count <= 5),
  CHECK (retry_count <= 2)
);

-- Index for OpenClaw polling
CREATE INDEX IF NOT EXISTS idx_tasks_poll
  ON tasks (status, assigned_agent_id, tokens_consumed, budget_tokens);

-- ── 4. Agent Runs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_id     TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_usd    REAL NOT NULL DEFAULT 0.0,
  status      TEXT NOT NULL DEFAULT 'success'
                CHECK (status IN ('success','failed','retry')),
  summary     TEXT,                          -- 300-token structured summary
  model       TEXT DEFAULT 'gpt-4o',
  started_at  TEXT DEFAULT (datetime('now')),
  finished_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_agent ON agent_runs (agent_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_runs_task  ON agent_runs (task_id);

-- ── 5. Memory Summaries ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS memory_summaries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_id     TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  summary     TEXT NOT NULL,                 -- max 300 tokens, structured JSON
  importance  INTEGER DEFAULT 1 CHECK (importance IN (1,2,3)),
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_memory_agent ON memory_summaries (agent_id, created_at DESC);

-- ── 6. Token Usage (daily ledger) ─────────────────────────────
CREATE TABLE IF NOT EXISTS token_usage (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,                 -- YYYY-MM-DD
  tokens_in   INTEGER DEFAULT 0,
  tokens_out  INTEGER DEFAULT 0,
  cost_usd    REAL DEFAULT 0.0,
  model       TEXT DEFAULT 'gpt-4o',
  UNIQUE (agent_id, date, model)
);

CREATE INDEX IF NOT EXISTS idx_usage_date ON token_usage (date DESC);

-- ── Guardrail: prevent subtask creation if budget exceeded ─────
CREATE TRIGGER IF NOT EXISTS guard_subtask_depth
BEFORE INSERT ON tasks
WHEN NEW.depth > 3
BEGIN
  SELECT RAISE(ABORT, 'GUARDRAIL: task depth exceeds maximum of 3');
END;

CREATE TRIGGER IF NOT EXISTS guard_subtask_count
BEFORE INSERT ON tasks
WHEN NEW.parent_task_id IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'GUARDRAIL: parent task already has 5 subtasks')
  WHERE (SELECT subtask_count FROM tasks WHERE id = NEW.parent_task_id) >= 5;
END;

CREATE TRIGGER IF NOT EXISTS guard_retry_count
BEFORE UPDATE ON tasks
WHEN NEW.retry_count > 2
BEGIN
  SELECT RAISE(ABORT, 'GUARDRAIL: max retries (2) exceeded for this task');
END;

CREATE TRIGGER IF NOT EXISTS guard_monthly_token_cap
BEFORE UPDATE ON agents
WHEN NEW.tokens_used_month > NEW.monthly_token_cap
BEGIN
  SELECT RAISE(ABORT, 'GUARDRAIL: monthly token cap exceeded for this agent');
END;

-- ── Auto-increment subtask_count on parent ─────────────────────
CREATE TRIGGER IF NOT EXISTS inc_subtask_count
AFTER INSERT ON tasks
WHEN NEW.parent_task_id IS NOT NULL
BEGIN
  UPDATE tasks
  SET subtask_count = subtask_count + 1,
      updated_at = datetime('now')
  WHERE id = NEW.parent_task_id;
END;

-- ── Auto-update updated_at timestamps ─────────────────────────
CREATE TRIGGER IF NOT EXISTS agents_updated_at
AFTER UPDATE ON agents
BEGIN
  UPDATE agents SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS tasks_updated_at
AFTER UPDATE ON tasks
BEGIN
  UPDATE tasks SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ── Seed: core OpenClaw agents (safe – skips if already exists)─
INSERT OR IGNORE INTO agents (id, name, role, type, status, emoji, about, skills)
VALUES
  ('max',          'Max',          'Director of Strategy',      'LEAD', 'working', '🧠', 'Sets direction and keeps team aligned.',           '["strategy","leadership","okr"]'),
  ('jordan',       'Jordan',       'Project Operations Lead',   'LEAD', 'working', '⚡', 'Turns strategy into deliverables.',                '["ops","coordination","execution"]'),
  ('sage',         'Sage',         'Brand & Messaging',         'SPC',  'working', '✍️', 'Builds brand voice and conversion copy.',           '["copywriting","brand","messaging"]'),
  ('taylor',       'Taylor',       'DevOps & Deployment',       'INT',  'working', '🔧', 'Keeps deploys fast and infra reliable.',            '["devops","ci-cd","performance"]'),
  ('morgan',       'Morgan',       'Competitive Intelligence',  'SPC',  'working', '🔍', 'Tracks competitors and surfaces positioning gaps.', '["research","competitive","icp"]'),
  ('email-expert', 'Email Expert', 'Email Marketing',           'SPC',  'working', '📧', 'Builds sequences that convert.',                    '["email","automation","deliverability"]'),
  ('seo',          'SEO Expert',   'SEO & Content Strategy',    'SPC',  'working', '📈', 'Gets SellSig to page one.',                         '["seo","content","schema"]'),
  ('legal',        'Legal Counsel','Legal & Compliance',        'INT',  'idle',    '⚖️', 'Keeps SellSig compliant and protected.',             '["gdpr","ccpa","compliance"]'),
  ('cso',          'CSO',          'Chief Security Officer',    'INT',  'working', '🛡️', 'Secures infra, data, and reputation.',              '["security","soc2","pen-testing"]');
