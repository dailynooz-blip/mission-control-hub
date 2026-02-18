# OpenClaw × Turso Setup Guide

## Architecture

```
OpenClaw (local) ──polls──► Turso (SQLite edge DB, free tier)
                               ▲
SellSig Dashboard ──reads──────┘  (15s polling, no backend)
```

No webhooks. No exposed ports. No Supabase account required.

---

## 1. Create Your Free Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create DB
turso db create openclaw-state

# Get your DB URL
turso db show openclaw-state --url
# → libsql://openclaw-state-<org>.turso.io

# Create an auth token
turso db tokens create openclaw-state
```

---

## 2. Apply the Schema

```bash
turso db shell openclaw-state < src/lib/tursoSchema.sql
```

This creates all 6 tables + guardrail triggers + seeds the 9 agents.

---

## 3. Add Environment Variables

Create a `.env` file at the project root (never commit this):

```env
VITE_TURSO_URL=libsql://openclaw-state-<org>.turso.io
VITE_TURSO_AUTH_TOKEN=<your-token>
```

The dashboard will auto-detect and switch from mock data → live Turso data.

---

## 4. Configure OpenClaw Polling

In your OpenClaw config, point it at the Turso HTTP API:

```python
TURSO_URL = "https://openclaw-state-<org>.turso.io"
TURSO_TOKEN = "<your-token>"
POLL_INTERVAL = 15  # seconds

# Polling query OpenClaw runs every cycle:
POLL_SQL = """
  SELECT t.*, a.model, a.tokens_used_month, a.monthly_token_cap
  FROM tasks t
  JOIN agents a ON a.id = t.assigned_agent_id
  WHERE t.status = 'pending'
    AND t.assigned_agent_id = :agent_id
    AND t.tokens_consumed < t.budget_tokens
    AND a.tokens_used_month < a.monthly_token_cap
  ORDER BY t.priority ASC, t.created_at ASC
  LIMIT 1
"""
```

---

## 5. OpenClaw Run Completion Flow

When OpenClaw finishes a task, it executes these statements:

```sql
-- 1. Update task status
UPDATE tasks
SET status = 'done',
    tokens_consumed = :tokens_used,
    updated_at = datetime('now')
WHERE id = :task_id;

-- 2. Log the run
INSERT INTO agent_runs
  (agent_id, task_id, tokens_used, cost_usd, status, summary, model, finished_at)
VALUES (:agent_id, :task_id, :tokens, :cost, 'success', :summary, :model, datetime('now'));

-- 3. Update agent monthly counter
UPDATE agents
SET tokens_used_month = tokens_used_month + :tokens_used,
    updated_at = datetime('now')
WHERE id = :agent_id;

-- 4. Write memory summary (max 300 tokens)
INSERT INTO memory_summaries (agent_id, task_id, summary, importance)
VALUES (:agent_id, :task_id, :summary_json, :importance);

-- 5. Upsert daily token ledger
INSERT INTO token_usage (agent_id, date, tokens_in, tokens_out, cost_usd, model)
VALUES (:agent_id, date('now'), :tokens_in, :tokens_out, :cost, :model)
ON CONFLICT (agent_id, date, model) DO UPDATE SET
  tokens_in  = tokens_in  + excluded.tokens_in,
  tokens_out = tokens_out + excluded.tokens_out,
  cost_usd   = cost_usd   + excluded.cost_usd;
```

---

## Guardrails (enforced at DB level via triggers)

| Rule              | Limit | Enforced by              |
|-------------------|-------|--------------------------|
| Task depth        | ≤ 3   | CHECK + TRIGGER          |
| Max subtasks      | ≤ 5   | TRIGGER on parent        |
| Max retries       | ≤ 2   | CHECK on retry_count     |
| Monthly token cap | agent-specific | TRIGGER on agents |
| Budget per task   | task-specific  | Polling query WHERE      |

All guardrails raise `ABORT` errors that OpenClaw must handle gracefully.

---

## Turso Free Tier Limits

- 500 MB storage
- 1 billion row reads / month
- 25 million row writes / month
- 3 databases

More than sufficient for a local agent polling system.
