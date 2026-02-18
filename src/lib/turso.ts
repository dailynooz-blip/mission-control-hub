/**
 * Turso HTTP API client (no backend needed — REST polling works from browser/OpenClaw)
 * Docs: https://docs.turso.tech/sdk/http/reference
 *
 * Credentials are read dynamically from tursoConfig (localStorage → env fallback)
 * so they can be changed without a rebuild.
 */

import { getTursoUrl, getTursoToken, isTursoConfigured } from "./tursoConfig";
import schemaSql from "./tursoSchema.sql?raw";

export { isTursoConfigured };

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TursoRow {
  [key: string]: string | number | boolean | null;
}

export interface TursoResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
}

// ── Raw HTTP execute ───────────────────────────────────────────────────────────

export async function tursoQuery(
  sql: string,
  args: (string | number | boolean | null)[] = [],
  overrideUrl?: string,
  overrideToken?: string
): Promise<TursoResult> {
  const url = overrideUrl ?? getTursoUrl();
  const token = overrideToken ?? getTursoToken();

  if (!url || !token) {
    throw new Error(
      "Turso not configured. Use the setup panel to enter your URL and token."
    );
  }

  const endpoint = `${url}/v2/pipeline`;
  const body = {
    requests: [
      {
        type: "execute",
        stmt: {
          sql,
          args: args.map((a) =>
            a === null
              ? { type: "null" }
              : typeof a === "number"
              ? { type: "integer", value: String(a) }
              : { type: "text", value: String(a) }
          ),
        },
      },
      { type: "close" },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turso HTTP error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const result = json.results?.[0]?.response?.result;
  if (!result) throw new Error("Unexpected Turso response shape");

  return {
    columns: result.cols?.map((c: { name: string }) => c.name) ?? [],
    rows: result.rows ?? [],
  };
}

/** Convert raw rows → array of objects */
export function rowsToObjects(result: TursoResult): TursoRow[] {
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((col, i) => [col, row[i]]))
  );
}

// ── Schema runner ─────────────────────────────────────────────────────────────

/**
 * Sends all CREATE TABLE, CREATE INDEX, CREATE TRIGGER, INSERT statements
 * from tursoSchema.sql as a single pipeline batch.
 * Safe to re-run (uses IF NOT EXISTS / INSERT OR IGNORE).
 */
export async function runSchema(
  overrideUrl?: string,
  overrideToken?: string,
  onProgress?: (step: number, total: number, sql: string) => void
): Promise<void> {
  const url = overrideUrl ?? getTursoUrl();
  const token = overrideToken ?? getTursoToken();

  if (!url || !token) throw new Error("No credentials provided");

  // Split statements, remove comments and blank lines
  const statements = schemaSql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 &&
        !s.startsWith("--") &&
        !s.match(/^\/\*/) &&
        !s.startsWith("PRAGMA") // skip PRAGMA for HTTP API
    );

  const requests: { type: string; stmt?: { sql: string; args: [] } }[] =
    statements.map((sql) => ({
      type: "execute",
      stmt: { sql, args: [] as [] },
    }));
  requests.push({ type: "close" });

  const res = await fetch(`${url}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Schema run failed (${res.status}): ${text}`);
  }

  const json = await res.json();

  // Check each result for errors (ignore "already exists" — those are safe)
  for (let i = 0; i < json.results?.length; i++) {
    const r = json.results[i];
    if (r.type === "error") {
      const msg: string = r.error?.message ?? "Unknown error";
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate column name")
      ) {
        continue; // safe to ignore
      }
      throw new Error(`Statement ${i + 1} failed: ${msg}`);
    }
    if (onProgress) onProgress(i + 1, statements.length, statements[i] ?? "");
  }
}

// ── Typed helpers ─────────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<TursoRow[]> {
  const r = await tursoQuery("SELECT * FROM agents ORDER BY created_at DESC");
  return rowsToObjects(r);
}

export async function fetchGoals(): Promise<TursoRow[]> {
  const r = await tursoQuery("SELECT * FROM goals ORDER BY created_at DESC");
  return rowsToObjects(r);
}

export async function fetchPendingTasks(agentId?: string): Promise<TursoRow[]> {
  if (agentId) {
    const r = await tursoQuery(
      `SELECT t.*, a.name AS agent_name, a.emoji, g.title AS goal_title
       FROM tasks t
       LEFT JOIN agents a ON a.id = t.assigned_agent_id
       LEFT JOIN goals g ON g.id = t.goal_id
       WHERE t.status = 'pending' AND t.assigned_agent_id = ?
       ORDER BY t.priority ASC, t.created_at ASC`,
      [agentId]
    );
    return rowsToObjects(r);
  }
  const r = await tursoQuery(
    `SELECT t.*, a.name AS agent_name, a.emoji, g.title AS goal_title
     FROM tasks t
     LEFT JOIN agents a ON a.id = t.assigned_agent_id
     LEFT JOIN goals g ON g.id = t.goal_id
     WHERE t.status = 'pending'
     ORDER BY t.priority ASC, t.created_at ASC`
  );
  return rowsToObjects(r);
}

export async function fetchAllTasks(): Promise<TursoRow[]> {
  const r = await tursoQuery(
    `SELECT t.*, a.name AS agent_name, a.emoji, g.title AS goal_title
     FROM tasks t
     LEFT JOIN agents a ON a.id = t.assigned_agent_id
     LEFT JOIN goals g ON g.id = t.goal_id
     ORDER BY t.priority ASC, t.updated_at DESC`
  );
  return rowsToObjects(r);
}

export async function fetchAgentRuns(limit = 50): Promise<TursoRow[]> {
  const r = await tursoQuery(
    `SELECT ar.*, a.name AS agent_name, t.title AS task_title
     FROM agent_runs ar
     LEFT JOIN agents a ON a.id = ar.agent_id
     LEFT JOIN tasks t ON t.id = ar.task_id
     ORDER BY ar.started_at DESC LIMIT ?`,
    [limit]
  );
  return rowsToObjects(r);
}

export async function fetchMemorySummaries(agentId?: string): Promise<TursoRow[]> {
  if (agentId) {
    const r = await tursoQuery(
      "SELECT * FROM memory_summaries WHERE agent_id = ? ORDER BY created_at DESC",
      [agentId]
    );
    return rowsToObjects(r);
  }
  const r = await tursoQuery("SELECT * FROM memory_summaries ORDER BY created_at DESC");
  return rowsToObjects(r);
}

export async function fetchTokenUsage(): Promise<TursoRow[]> {
  const r = await tursoQuery(
    `SELECT tu.*, a.name AS agent_name
     FROM token_usage tu
     LEFT JOIN agents a ON a.id = tu.agent_id
     ORDER BY tu.date DESC LIMIT 90`
  );
  return rowsToObjects(r);
}

/** Update a task status (called by UI or OpenClaw) */
export async function updateTaskStatus(
  taskId: string,
  status: string,
  errorMsg?: string
): Promise<void> {
  await tursoQuery(
    "UPDATE tasks SET status = ?, error_message = ?, updated_at = datetime('now') WHERE id = ?",
    [status, errorMsg ?? null, taskId]
  );
}

/** Log a completed agent run */
export async function logAgentRun(run: {
  agentId: string;
  taskId: string;
  tokensUsed: number;
  costUsd: number;
  status: "success" | "failed" | "retry";
  summary: string;
  model?: string;
}): Promise<void> {
  await tursoQuery(
    `INSERT INTO agent_runs
       (agent_id, task_id, tokens_used, cost_usd, status, summary, model, started_at, finished_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [
      run.agentId,
      run.taskId,
      run.tokensUsed,
      run.costUsd,
      run.status,
      run.summary,
      run.model ?? "gpt-4o",
    ]
  );
}
