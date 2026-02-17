import { useState, useEffect } from "react";
import KanbanBoard from "./KanbanBoard";
import TeamChat from "./TeamChat";
import DecisionsLog from "./DecisionsLog";
import FilesGrid from "./FilesGrid";
import DailyGoals from "./DailyGoals";
import AlertsPanel from "./AlertsPanel";
import TimeTracking from "./TimeTracking";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "board", label: "Project Board" },
  { id: "chat", label: "Team Chat" },
  { id: "decisions", label: "Decisions" },
  { id: "files", label: "Files" },
  { id: "goals", label: "Daily Goals" },
  { id: "alerts", label: "Alerts" },
  { id: "time", label: "Time Tracking" },
];

const stats = [
  { number: "9", label: "Total Agents" },
  { number: "2", label: "Active" },
  { number: "12", label: "Completed" },
  { number: "5", label: "In Progress" },
  { number: "3", label: "Alerts" },
];

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => setLastRefreshed(new Date()), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-background text-foreground p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span>🎯</span>
          <span>SellSig Mission Control</span>
        </h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-primary"
            />
            Auto-refresh 30s
          </label>
          <button
            onClick={() => setLastRefreshed(new Date())}
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border pb-2.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface-card rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">{s.number}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <KanbanBoard />
        </div>
      )}

      {activeTab === "board" && <KanbanBoard fullPage />}
      {activeTab === "chat" && <TeamChat />}
      {activeTab === "decisions" && <DecisionsLog />}
      {activeTab === "files" && <FilesGrid />}
      {activeTab === "goals" && <DailyGoals />}
      {activeTab === "alerts" && <AlertsPanel />}
      {activeTab === "time" && <TimeTracking />}
    </div>
  );
}
