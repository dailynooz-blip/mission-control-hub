const alerts = [
  { type: "success" as const, text: "✅ Complete: Landing page fixed - now using professional theme" },
  { type: "success" as const, text: "✅ Complete: New marketing poster - \"Buyer Signal Intelligence\"" },
  { type: "info" as const, text: "🔄 In Progress: Building & deploying to sevend9.com" },
  { type: "info" as const, text: "🤖 Team: 14 agents working autonomously" },
  { type: "warning" as const, text: "🌐 Live: https://sevend9.com (deploying...)" },
];

const alertStyles = {
  info: "bg-primary/10 border-l-4 border-primary text-foreground",
  success: "bg-success/10 border-l-4 border-success text-foreground",
  warning: "bg-warning/10 border-l-4 border-warning text-foreground",
  error: "bg-danger/10 border-l-4 border-danger text-foreground",
};

export default function AlertsPanel() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Alerts</h2>
      <div className="space-y-2.5">
        {alerts.map((a, i) => (
          <div key={i} className={`px-4 py-3 rounded-lg text-sm ${alertStyles[a.type]}`}>
            {a.text}
          </div>
        ))}
      </div>
    </div>
  );
}
