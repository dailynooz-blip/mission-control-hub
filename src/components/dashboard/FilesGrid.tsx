const files = [
  { icon: "📄", name: "keyword-research.md", by: "Keyword Expert", date: "Today 1:28 AM" },
  { icon: "📊", name: "gong-analysis.md", by: "Morgan", date: "Today 1:29 AM" },
  { icon: "📧", name: "email-sequence.md", by: "Email Expert", date: "Today 1:29 AM" },
  { icon: "📜", name: "privacy-policy.md", by: "Legal Counsel", date: "Today 1:30 AM" },
  { icon: "📜", name: "terms-of-service.md", by: "Legal Counsel", date: "Today 1:30 AM" },
  { icon: "🍪", name: "cookie-policy.md", by: "Legal Counsel", date: "Today 1:30 AM" },
  { icon: "🧭", name: "seo-strategy.md", by: "SEO Expert", date: "Today 1:28 AM" },
  { icon: "🛡️", name: "security-brain/", by: "CSO", date: "Today 1:32 AM" },
  { icon: "📄", name: "agent-control-center.html", by: "Me", date: "Today 1:33 AM" },
  { icon: "📋", name: "COMMAND-CENTER.md", by: "Max + Jordan", date: "Today 6:25 PM" },
];

export default function FilesGrid() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Files</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {files.map((f, i) => (
          <div key={i} className="bg-surface-card rounded-xl p-4 text-center hover:bg-secondary transition-colors cursor-pointer group">
            <div className="text-3xl">{f.icon}</div>
            <div className="text-xs text-foreground mt-2 font-medium break-all leading-snug group-hover:text-primary transition-colors">{f.name}</div>
            <div className="text-[10px] text-primary mt-1">{f.by}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{f.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
