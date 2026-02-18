/**
 * React hook: polls Turso every N seconds for live OpenClaw agent state.
 * Falls back to static mock data when Turso is not configured.
 */
import { useState, useEffect, useCallback } from "react";
import {
  fetchAgents,
  fetchAllTasks,
  fetchAgentRuns,
  fetchMemorySummaries,
  fetchTokenUsage,
  isTursoConfigured,
  TursoRow,
} from "@/lib/turso";
import { AGENTS, TASK_COLUMNS, type Agent, type AgentTask, type TaskStatus } from "@/components/dashboard/agentsData";

const POLL_INTERVAL_MS = 15_000; // 15 seconds

export interface LiveAgentData {
  agents: Agent[];
  runs: TursoRow[];
  memory: TursoRow[];
  tokenUsage: TursoRow[];
  isLive: boolean;          // true = Turso connected, false = mock data
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
}

function mapTursoToAgent(row: TursoRow, taskRows: TursoRow[]): Agent {
  const agentTasks: AgentTask[] = taskRows
    .filter((t) => t.assigned_agent_id === row.id)
    .map((t) => ({
      id: String(t.id),
      agentId: String(t.assigned_agent_id),
      title: String(t.title),
      description: String(t.description ?? ""),
      status: String(t.status) as TaskStatus,
      priority: (Number(t.priority) as 1 | 2 | 3) || 2,
      tags: (() => {
        try { return JSON.parse(String(t.tags ?? "[]")); } catch { return []; }
      })(),
      daysAgo: Number(t.days_ago ?? 0),
    }));

  let skills: string[] = [];
  try { skills = JSON.parse(String(row.skills ?? "[]")); } catch { skills = []; }

  return {
    id: String(row.id),
    name: String(row.name),
    role: String(row.role),
    type: String(row.type) as "LEAD" | "SPC" | "INT",
    status: String(row.status) as "working" | "idle" | "waiting",
    emoji: String(row.emoji ?? "🤖"),
    about: String(row.about ?? ""),
    skills,
    statusReason: String(row.status_reason ?? ""),
    sinceAgo: String(row.since_ago ?? ""),
    tasks: agentTasks,
  };
}

export function useTursoData(): LiveAgentData {
  const live = isTursoConfigured();

  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [runs, setRuns] = useState<TursoRow[]>([]);
  const [memory, setMemory] = useState<TursoRow[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TursoRow[]>([]);
  const [isLoading, setIsLoading] = useState(live);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refetch = useCallback(async () => {
    if (!live) return;
    try {
      setIsLoading(true);
      const [agentRows, taskRows, runRows, memRows, usageRows] = await Promise.all([
        fetchAgents(),
        fetchAllTasks(),
        fetchAgentRuns(50),
        fetchMemorySummaries(),
        fetchTokenUsage(),
      ]);

      const mappedAgents = agentRows.map((a) => mapTursoToAgent(a, taskRows));
      setAgents(mappedAgents);
      setRuns(runRows);
      setMemory(memRows);
      setTokenUsage(usageRows);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [live]);

  // Initial fetch + polling
  useEffect(() => {
    if (!live) return;
    refetch();
    const id = setInterval(refetch, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [live, refetch]);

  return {
    agents,
    runs,
    memory,
    tokenUsage,
    isLive: live,
    isLoading,
    error,
    lastUpdated,
    refetch,
  };
}

export { TASK_COLUMNS };
