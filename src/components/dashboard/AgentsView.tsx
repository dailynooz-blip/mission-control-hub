import { useState } from "react";
import { AGENTS, TASK_COLUMNS, type Agent, type TaskStatus } from "./agentsData";

// ── Agent Sidebar ────────────────────────────────────────────────────────────
function AgentSidebar({
  selected,
  onSelect,
}: {
  selected: Agent;
  onSelect: (a: Agent) => void;
}) {
  const working = AGENTS.filter((a) => a.status === "working").length;

  return (
    <div className="w-56 flex-shrink-0 bg-surface-card rounded-xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Agents
        </span>
        <span className="bg-surface-deep text-foreground text-xs rounded-full px-2 py-0.5 font-bold">
          {AGENTS.length}
        </span>
      </div>

      {/* All agents row */}
      <button
        onClick={() => onSelect(AGENTS[0])}
        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border"
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          ALL
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-foreground">All Agents</div>
          <div className="text-[10px] text-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            {working} Active
          </div>
        </div>
      </button>

      <div className="flex-1 overflow-y-auto">
        {AGENTS.map((agent) => {
          const isSelected = selected.id === agent.id;
          const dotColor =
            agent.status === "working"
              ? "bg-success pulse-dot"
              : agent.status === "waiting"
              ? "bg-warning"
              : "bg-muted-foreground";
          const statusLabel =
            agent.status === "working"
              ? "WORKING"
              : agent.status === "waiting"
              ? "WAITING"
              : "IDLE";
          const statusColor =
            agent.status === "working"
              ? "text-success"
              : agent.status === "waiting"
              ? "text-warning"
              : "text-muted-foreground";

          const typeBadge: Record<string, string> = {
            LEAD: "bg-yellow-500/20 text-yellow-400",
            SPC: "bg-primary/20 text-primary",
            INT: "bg-success/20 text-success",
          };

          return (
            <button
              key={agent.id}
              onClick={() => onSelect(agent)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50 ${
                isSelected ? "bg-secondary" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-surface-deep flex items-center justify-center text-base flex-shrink-0">
                {agent.emoji}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{agent.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${typeBadge[agent.type]}`}>
                    {agent.type}
                  </span>
                </div>
                <div className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${dotColor}`} />
                  {statusLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, agent }: { task: (typeof AGENTS)[0]["tasks"][0]; agent: Agent }) {
  const priorityColor = task.priority === 1 ? "text-danger" : task.priority === 2 ? "text-warning" : "text-muted-foreground";
  return (
    <div className="bg-surface-deep rounded-xl p-4 mb-3 hover:border-primary/40 border border-border/50 transition-colors cursor-pointer group">
      <div className="flex items-start gap-2 mb-2">
        <span className={`text-xs font-bold mt-0.5 ${priorityColor}`}>
          {task.priority === 1 ? "↑" : task.priority === 2 ? "→" : "↓"}
        </span>
        <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors flex-1">
          {task.title}
        </p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
        {task.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{agent.emoji}</span>
          <span className="text-[10px] text-primary font-medium">{agent.name}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {task.daysAgo === 0 ? "today" : `${task.daysAgo}d ago`}
        </span>
      </div>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {task.tags.map((tag) => (
            <span key={tag} className="text-[10px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Task Board ───────────────────────────────────────────────────────────────
function TaskBoard({
  agent,
  filterStatus,
}: {
  agent: Agent;
  filterStatus: TaskStatus | "all";
}) {
  const filteredCols =
    filterStatus === "all"
      ? TASK_COLUMNS
      : TASK_COLUMNS.filter((c) => c.id === filterStatus);

  const colsToShow = filteredCols.map((col) => ({
    ...col,
    tasks: agent.tasks.filter((t) => t.status === col.id),
  }));

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 min-h-[400px]">
      {colsToShow.map((col) => (
        <div key={col.id} className="min-w-[240px] flex-shrink-0">
          <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider ${col.color}`}>
            <span className={`w-2 h-2 rounded-full ${col.dot}`} />
            {col.label}
            <span className="ml-auto bg-surface-deep text-muted-foreground rounded px-1.5 py-0.5 font-mono">
              {col.tasks.length}
            </span>
          </div>
          <div>
            {col.tasks.length === 0 ? (
              <div className="border-2 border-dashed border-border/40 rounded-xl h-24 flex items-center justify-center">
                <span className="text-xs text-muted-foreground/50">—</span>
              </div>
            ) : (
              col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} agent={agent} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Agent Profile Panel ──────────────────────────────────────────────────────
function AgentProfilePanel({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"attention" | "timeline" | "messages">("attention");

  const attentionTasks = agent.tasks.filter((t) => t.status !== "done");

  return (
    <div className="w-72 flex-shrink-0 bg-surface-card rounded-xl flex flex-col overflow-hidden border border-border/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Agent Profile
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none transition-colors">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center border-b border-border">
          <div className="w-16 h-16 rounded-2xl bg-surface-deep flex items-center justify-center text-3xl mb-3 border border-border">
            {agent.emoji}
          </div>
          <h3 className="font-bold text-foreground text-lg">{agent.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{agent.role}</p>
          <div className="mt-2">
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
              {agent.type === "LEAD" ? "Lead" : agent.type === "SPC" ? "Specialist" : "Integrator"}
            </span>
          </div>

          <button
            className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              agent.status === "working"
                ? "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                : agent.status === "waiting"
                ? "bg-warning/20 text-warning border border-warning/30"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                agent.status === "working"
                  ? "bg-success pulse-dot"
                  : agent.status === "waiting"
                  ? "bg-warning"
                  : "bg-muted-foreground"
              }`}
            />
            {agent.status.toUpperCase()}
          </button>
        </div>

        {/* Status Reason */}
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Status Reason:
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">{agent.statusReason}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5">Since {agent.sinceAgo}</p>
        </div>

        {/* About */}
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            About
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">{agent.about}</p>
        </div>

        {/* Skills */}
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agent.skills.map((skill) => (
              <span key={skill} className="text-[10px] bg-secondary text-foreground/70 px-2 py-0.5 rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3">
          <div className="flex gap-1 mb-3">
            {(["attention", "timeline", "messages"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[11px] px-2 py-1 rounded transition-colors capitalize ${
                  tab === t
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "attention" && `⚠️ Attention `}
                {t === "timeline" && `📅 Timeline`}
                {t === "messages" && `💬 Messages`}
                {t === "attention" && (
                  <span className="bg-danger/20 text-danger text-[9px] font-bold px-1 rounded ml-0.5">
                    {attentionTasks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === "attention" && (
            <div className="space-y-2 pb-3">
              {attentionTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">All clear ✅</p>
              ) : (
                attentionTasks.map((task) => (
                  <div key={task.id} className="bg-surface-deep rounded-lg p-3">
                    <p className="text-xs font-medium text-foreground">{task.title}</p>
                    <span className={`text-[10px] font-bold uppercase mt-1 inline-block ${
                      task.status === "in-progress" ? "text-primary" :
                      task.status === "waiting" ? "text-warning" :
                      task.status === "review" ? "text-orange-400" :
                      "text-muted-foreground"
                    }`}>{task.status}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "timeline" && (
            <div className="space-y-2 pb-3">
              {agent.tasks.map((task) => (
                <div key={task.id} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                      task.status === "done" ? "bg-success" :
                      task.status === "in-progress" ? "bg-primary" : "bg-border"
                    }`} />
                    <div className="w-px bg-border flex-1 mt-1 min-h-[20px]" />
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-xs text-foreground leading-snug">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">{task.daysAgo === 0 ? "today" : `${task.daysAgo}d ago`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "messages" && (
            <div className="pb-3">
              <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Send Message */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Send Message to {agent.name}
        </div>
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${agent.name}... (@ to mention)`}
            className="flex-1 bg-surface-deep border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={() => setMessage("")}
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-3 py-2 rounded-lg text-xs transition-colors"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AgentsView ──────────────────────────────────────────────────────────
export default function AgentsView() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [showProfile, setShowProfile] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");

  const taskCounts = TASK_COLUMNS.reduce((acc, col) => {
    acc[col.id] = selectedAgent.tasks.filter((t) => t.status === col.id).length;
    return acc;
  }, {} as Record<string, number>);
  const totalActive = AGENTS.filter((a) => a.status === "working").length;
  const totalQueue = AGENTS.reduce((sum, a) => sum + a.tasks.filter((t) => t.status !== "done").length, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-6 mb-4 flex-wrap">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{totalActive}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Agents Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{totalQueue}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks In Queue</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtering by:</span>
          <span className="bg-surface-card border border-primary/30 text-primary text-xs px-3 py-1 rounded-lg font-medium">
            {selectedAgent.name}
          </span>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="bg-surface-card hover:bg-secondary border border-border text-xs px-3 py-1 rounded-lg text-muted-foreground transition-colors"
          >
            {showProfile ? "Hide" : "Show"} Profile
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left: agent list */}
        <AgentSidebar selected={selectedAgent} onSelect={setSelectedAgent} />

        {/* Center: task board */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Agent tasks header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-warning inline-block" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {selectedAgent.name}'s Tasks
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filterStatus === "all" ? "bg-surface-card text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            {TASK_COLUMNS.map((col) => (
              <button
                key={col.id}
                onClick={() => setFilterStatus(col.id)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  filterStatus === col.id ? `bg-surface-card font-semibold text-foreground` : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                {col.label.charAt(0) + col.label.slice(1).toLowerCase()}
                <span className="bg-surface-deep rounded px-1 text-[10px] font-mono">{taskCounts[col.id] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Board */}
          <div className="flex-1 overflow-x-auto">
            <TaskBoard agent={selectedAgent} filterStatus={filterStatus} />
          </div>
        </div>

        {/* Right: agent profile */}
        {showProfile && (
          <AgentProfilePanel agent={selectedAgent} onClose={() => setShowProfile(false)} />
        )}
      </div>
    </div>
  );
}
