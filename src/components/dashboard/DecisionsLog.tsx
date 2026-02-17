const decisions = [
  {
    title: "Website pivot to \"Buyer Signal Intelligence\"",
    madeBy: "Max",
    date: "Today 6:14 PM",
    reasoning: "\"Every sales tool says AI-powered. We need a sharper angle. Own 'signal in the noise.'\"",
  },
  {
    title: "Build website in Lovable",
    madeBy: "Jordan",
    date: "Today 6:38 PM",
    reasoning: "\"Already has Vite + React + shadcn-ui + Tailwind. Easy deploy + custom domain support.\"",
  },
  {
    title: "Communication hierarchy established",
    madeBy: "Max + Jordan",
    date: "Today 6:25 PM",
    reasoning: "\"Max → Jordan → Staff. Jordan handles ops <$5K, Max handles >$5K. Monday briefings.\"",
  },
];

export default function DecisionsLog() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Decisions Log</h2>
      <div className="space-y-3">
        {decisions.map((d, i) => (
          <div key={i} className="bg-surface-card rounded-xl p-4 border-l-4 border-primary">
            <div className="font-semibold text-foreground text-sm">{d.title}</div>
            <div className="text-primary text-xs mt-1">Made by: {d.madeBy}</div>
            <div className="text-muted-foreground text-[11px] mt-0.5">{d.date}</div>
            <div className="text-foreground/70 text-sm mt-2 italic">{d.reasoning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
