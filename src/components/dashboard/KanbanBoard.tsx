interface KanbanBoardProps {
  fullPage?: boolean;
}

const columns = [
  {
    id: "todo",
    label: "📋 To Do",
    colorClass: "text-warning",
    cards: [
      { title: "Connect custom domain", assignee: "Jordan", meta: "Est: 2h" },
      { title: "Design pricing page", assignee: "Sage", meta: "Est: 4h" },
      { title: "SEO optimization", assignee: "Taylor", meta: "Est: 3h" },
    ],
  },
  {
    id: "inprogress",
    label: "🔄 In Progress",
    colorClass: "text-primary",
    cards: [
      { title: "Website revamp - Hero", assignee: "Max + Jordan", meta: "Started: 6:41 PM" },
      { title: "Agent Control Center", assignee: "Me", meta: "Started: 8:30 PM" },
    ],
  },
  {
    id: "review",
    label: "👀 Review",
    colorClass: "text-warning",
    cards: [
      { title: "Brand messaging", assignee: "Sage", meta: "Awaiting approval" },
    ],
  },
  {
    id: "done",
    label: "✅ Done",
    colorClass: "text-success",
    cards: [
      { title: "Communication system", assignee: "Max + Jordan", meta: "Done: 6:25 PM" },
      { title: "Website strategy", assignee: "Max + Jordan", meta: "Done: 6:14 PM" },
      { title: "Sales Director brain", assignee: "Me", meta: "Done: 4:31 PM" },
    ],
  },
];

export default function KanbanBoard({ fullPage }: KanbanBoardProps) {
  return (
    <div>
      {fullPage && (
        <h2 className="text-lg font-semibold text-foreground mb-4">Project Board</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.id} className="bg-surface-card rounded-xl p-4 min-h-[200px]">
            <div className={`text-sm font-bold mb-4 pb-2.5 border-b border-border ${col.colorClass}`}>
              {col.label}
            </div>
            <div className="space-y-2.5">
              {col.cards.map((card, i) => (
                <div key={i} className="bg-surface-deep rounded-lg p-3 text-sm">
                  <div className="text-foreground">{card.title}</div>
                  <div className="text-primary text-xs mt-2">{card.assignee}</div>
                  <div className="text-muted-foreground text-[11px] mt-1">{card.meta}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
