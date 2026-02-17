const rows = [
  { agent: "Max", task: "Website strategy & leadership", session: "45m", today: "2h 15m" },
  { agent: "Jordan", task: "Project scoping & execution", session: "30m", today: "1h 45m" },
  { agent: "Sage", task: "Brand messaging", session: "0m", today: "45m" },
  { agent: "Taylor", task: "DevOps & deployment", session: "0m", today: "30m" },
  { agent: "Me", task: "Brain building & mission control", session: "1h 20m", today: "4h 30m" },
];

export default function TimeTracking() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Time Tracking</h2>
      <div className="bg-surface-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-deep">
              <th className="px-4 py-3 text-left text-muted-foreground font-medium">Agent</th>
              <th className="px-4 py-3 text-left text-muted-foreground font-medium">Task</th>
              <th className="px-4 py-3 text-left text-muted-foreground font-medium">This Session</th>
              <th className="px-4 py-3 text-left text-muted-foreground font-medium">Today</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-primary font-medium">{r.agent}</td>
                <td className="px-4 py-3 text-foreground/80">{r.task}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.session}</td>
                <td className="px-4 py-3 text-success font-bold">{r.today}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
