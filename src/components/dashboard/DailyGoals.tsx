type GoalStatus = "In Progress" | "Done" | "To Do";

const goals: { text: string; assignee: string; status: GoalStatus }[] = [
  { text: "Website Hero section live", assignee: "Jordan + Taylor", status: "In Progress" },
  { text: "Keyword research complete", assignee: "Keyword Expert", status: "Done" },
  { text: "Gong.io competitive analysis", assignee: "Morgan", status: "Done" },
  { text: "Email welcome sequence", assignee: "Email Expert", status: "Done" },
  { text: "Legal docs (Privacy, Terms, Cookie)", assignee: "Legal Counsel", status: "Done" },
  { text: "SEO strategy document", assignee: "SEO Expert", status: "Done" },
  { text: "CSO brain + security framework", assignee: "CSO", status: "Done" },
  { text: "Connect sellsig.com domain", assignee: "Jordan", status: "To Do" },
  { text: "Pricing page designed", assignee: "Blake", status: "To Do" },
  { text: "Sales pipeline setup", assignee: "Riley + Sales Director", status: "To Do" },
];

const statusConfig: Record<GoalStatus, { cls: string; label: string }> = {
  "In Progress": { cls: "bg-primary/20 text-primary", label: "In Progress" },
  Done: { cls: "bg-success/20 text-success", label: "Done" },
  "To Do": { cls: "bg-warning/20 text-warning", label: "To Do" },
};

export default function DailyGoals() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Daily Goals</h2>
      <div className="bg-surface-card rounded-xl p-4 space-y-2.5">
        {goals.map((g, i) => (
          <div key={i} className="bg-surface-deep rounded-lg px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-foreground truncate">{g.text}</div>
              <div className="text-xs text-primary mt-0.5">{g.assignee}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap flex-shrink-0 ${statusConfig[g.status].cls}`}>
              {statusConfig[g.status].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
