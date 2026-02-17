export type TaskStatus = "inbox" | "assigned" | "in-progress" | "review" | "done" | "waiting";

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 1 | 2 | 3;
  tags: string[];
  daysAgo: number;
  agentId: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  type: "LEAD" | "SPC" | "INT";
  status: "working" | "idle" | "waiting";
  emoji: string;
  about: string;
  skills: string[];
  statusReason: string;
  sinceAgo: string;
  tasks: AgentTask[];
}

export const AGENTS: Agent[] = [
  {
    id: "max",
    name: "Max",
    role: "Director of Strategy",
    type: "LEAD",
    status: "working",
    emoji: "🧠",
    about: "I am Max, Director of Strategy. I set direction, resolve ambiguity, and keep the team aligned. Every decision is a calculated bet on the best outcome.",
    skills: ["leadership", "strategy", "vision", "decision-making", "prioritization"],
    statusReason: "Running weekly planning sync. Reviewing website conversion metrics and aligning team on Q1 targets.",
    sinceAgo: "2h ago",
    tasks: [
      { id: "m1", agentId: "max", title: "Q1 OKR Alignment", description: "Define measurable objectives for all agents across acquisition, activation, and retention.", status: "in-progress", priority: 1, tags: ["strategy", "okr", "q1"], daysAgo: 1 },
      { id: "m2", agentId: "max", title: "Website Conversion Audit", description: "Review funnel data and identify top 3 drop-off points to address before product launch.", status: "review", priority: 1, tags: ["conversion", "analytics"], daysAgo: 2 },
      { id: "m3", agentId: "max", title: "Investor Brief - Series A Narrative", description: "Draft the strategic narrative deck: problem, solution, traction, and ask.", status: "assigned", priority: 2, tags: ["fundraising", "narrative"], daysAgo: 3 },
      { id: "m4", agentId: "max", title: "Competitive Positioning Doc", description: "Map SellSig against Gong, Chorus, and Clari on 6 key dimensions.", status: "done", priority: 2, tags: ["competitive", "positioning"], daysAgo: 5 },
      { id: "m5", agentId: "max", title: "Team Capacity Review", description: "Audit current agent load and reassign overloaded tasks.", status: "waiting", priority: 3, tags: ["ops", "team"], daysAgo: 0 },
    ],
  },
  {
    id: "jordan",
    name: "Jordan",
    role: "Project Operations Lead",
    type: "LEAD",
    status: "working",
    emoji: "⚡",
    about: "I am Jordan, Ops Lead. I turn strategy into deliverables. I own the project board, unblock the team, and make sure nothing slips through the cracks.",
    skills: ["project-management", "execution", "ops", "unblocking", "coordination"],
    statusReason: "Coordinating domain transfer to sellsig.com. Running deployment checklist with Taylor.",
    sinceAgo: "45m ago",
    tasks: [
      { id: "j1", agentId: "jordan", title: "Domain Transfer - sellsig.com", description: "Transfer domain from registrar, update DNS, verify SSL certificate on Lovable deploy.", status: "in-progress", priority: 1, tags: ["domain", "devops", "launch"], daysAgo: 1 },
      { id: "j2", agentId: "jordan", title: "Sprint Board Cleanup", description: "Archive completed tasks, re-prioritize backlog, assign unassigned items.", status: "assigned", priority: 2, tags: ["ops", "board"], daysAgo: 2 },
      { id: "j3", agentId: "jordan", title: "Launch Checklist v2", description: "Update the go-live checklist with remaining items: analytics, forms, legal links.", status: "review", priority: 1, tags: ["launch", "checklist"], daysAgo: 3 },
      { id: "j4", agentId: "jordan", title: "Weekly Briefing Doc", description: "Compile agent outputs into the Monday briefing for Max review.", status: "done", priority: 2, tags: ["reporting", "weekly"], daysAgo: 6 },
      { id: "j5", agentId: "jordan", title: "Onboard CSO to Systems", description: "Provide CSO access to repo, secrets vault, and security framework docs.", status: "inbox", priority: 3, tags: ["onboarding", "security"], daysAgo: 0 },
    ],
  },
  {
    id: "sage",
    name: "Sage",
    role: "Brand & Messaging Specialist",
    type: "SPC",
    status: "working",
    emoji: "✍️",
    about: "I am Sage. Words are my craft. I build brand voice, write copy that converts, and make sure SellSig sounds like a category leader before it becomes one.",
    skills: ["copywriting", "brand-voice", "messaging", "headlines", "cta"],
    statusReason: "Finalizing hero headline A/B variants. Awaiting Riley's UX review before handoff.",
    sinceAgo: "1h ago",
    tasks: [
      { id: "s1", agentId: "sage", title: "Hero Headline A/B Variants", description: "Write 5 headline variants for hero section. Focus on signal-vs-noise angle and buyer-intent messaging.", status: "in-progress", priority: 1, tags: ["copy", "hero", "ab-test"], daysAgo: 1 },
      { id: "s2", agentId: "sage", title: "Pricing Page Copy", description: "Write value-led copy for Starter, Pro, Enterprise tiers. Highlight ROI per plan.", status: "assigned", priority: 1, tags: ["pricing", "copy"], daysAgo: 2 },
      { id: "s3", agentId: "sage", title: "Brand Voice Guidelines Doc", description: "Document SellSig tone: confident, data-driven, human. Include do/don't examples.", status: "review", priority: 2, tags: ["brand", "guidelines"], daysAgo: 4 },
      { id: "s4", agentId: "sage", title: "Homepage Subheadlines", description: "Write 3 supporting subheadlines for features section below hero.", status: "done", priority: 2, tags: ["copy", "homepage"], daysAgo: 5 },
    ],
  },
  {
    id: "taylor",
    name: "Taylor",
    role: "DevOps & Deployment",
    type: "INT",
    status: "working",
    emoji: "🔧",
    about: "I am Taylor. I make sure the code ships, the site stays up, and the infra scales. Fast deploys and zero-downtime are my baseline.",
    skills: ["deployment", "ci-cd", "dns", "performance", "monitoring"],
    statusReason: "Running build pipeline verification. Checking Core Web Vitals on staging.",
    sinceAgo: "30m ago",
    tasks: [
      { id: "t1", agentId: "taylor", title: "Deploy Staging to Production", description: "Run full deployment checklist: build pass, env vars, SSL, DNS propagation, smoke test.", status: "in-progress", priority: 1, tags: ["deploy", "production"], daysAgo: 0 },
      { id: "t2", agentId: "taylor", title: "Core Web Vitals Audit", description: "Achieve LCP <2.5s, FID <100ms, CLS <0.1 on all key pages.", status: "assigned", priority: 1, tags: ["performance", "seo", "cwv"], daysAgo: 1 },
      { id: "t3", agentId: "taylor", title: "Uptime Monitoring Setup", description: "Configure Uptime Robot or BetterStack to alert on any downtime within 1 minute.", status: "inbox", priority: 2, tags: ["monitoring", "ops"], daysAgo: 0 },
      { id: "t4", agentId: "taylor", title: "CDN Configuration", description: "Enable edge caching for assets. Target: 95%+ cache hit rate on static files.", status: "review", priority: 2, tags: ["cdn", "performance"], daysAgo: 3 },
      { id: "t5", agentId: "taylor", title: "Staging Environment Setup", description: "Configure separate staging URL for QA before each production push.", status: "done", priority: 3, tags: ["staging", "qa"], daysAgo: 7 },
    ],
  },
  {
    id: "morgan",
    name: "Morgan",
    role: "Competitive Intelligence",
    type: "SPC",
    status: "working",
    emoji: "🔍",
    about: "I am Morgan. I track the competition so we can out-position them. I find the gaps in Gong, Chorus, and Clari that SellSig can own.",
    skills: ["research", "competitive-analysis", "positioning", "market-intel", "pricing"],
    statusReason: "Building win/loss framework. Cross-referencing Gong G2 reviews for pain points.",
    sinceAgo: "2h ago",
    tasks: [
      { id: "mo1", agentId: "morgan", title: "Gong Win/Loss Analysis", description: "Extract top 50 negative Gong reviews from G2, Capterra, Reddit. Tag by theme.", status: "in-progress", priority: 1, tags: ["gong", "win-loss", "research"], daysAgo: 2 },
      { id: "mo2", agentId: "morgan", title: "Pricing Benchmark Report", description: "Map competitor pricing tiers, seat costs, and contract structures for sales enablement.", status: "assigned", priority: 1, tags: ["pricing", "benchmark"], daysAgo: 1 },
      { id: "mo3", agentId: "morgan", title: "ICP Definition", description: "Define Ideal Customer Profile: company size, stack, pain, budget, buying trigger.", status: "review", priority: 1, tags: ["icp", "targeting"], daysAgo: 4 },
      { id: "mo4", agentId: "morgan", title: "Gong.io Full Analysis", description: "Complete competitive teardown: features, pricing, positioning, weaknesses.", status: "done", priority: 2, tags: ["gong", "competitive"], daysAgo: 6 },
    ],
  },
  {
    id: "email-expert",
    name: "Email Expert",
    role: "Email Marketing Specialist",
    type: "SPC",
    status: "working",
    emoji: "📧",
    about: "I am the Email Expert. I build sequences that convert, nurture pipelines, and turn cold leads warm. Every email has a job to do.",
    skills: ["email-copy", "sequences", "automation", "segmentation", "deliverability"],
    statusReason: "Setting up welcome sequence in email service. Waiting on sign-up form integration.",
    sinceAgo: "3h ago",
    tasks: [
      { id: "e1", agentId: "email-expert", title: "Integrate Sign-Up Form", description: "Connect hero email capture form to email platform. Set up welcome trigger automation.", status: "waiting", priority: 1, tags: ["integration", "form", "automation"], daysAgo: 0 },
      { id: "e2", agentId: "email-expert", title: "Welcome Sequence - A/B Subject Lines", description: "Test 2 subject line approaches: curiosity-led vs data-led. Measure open rate difference.", status: "assigned", priority: 1, tags: ["email", "ab-test", "subjects"], daysAgo: 1 },
      { id: "e3", agentId: "email-expert", title: "Re-engagement Campaign", description: "3-email campaign for 30-day inactive subscribers. Goal: 15% reactivation rate.", status: "inbox", priority: 2, tags: ["re-engagement", "retention"], daysAgo: 0 },
      { id: "e4", agentId: "email-expert", title: "5-Email Welcome Sequence", description: "Welcome → Value → Social Proof → Features → CTA. Deliverables delivered.", status: "done", priority: 1, tags: ["welcome", "sequence"], daysAgo: 6 },
    ],
  },
  {
    id: "seo",
    name: "SEO Expert",
    role: "SEO & Content Strategy",
    type: "SPC",
    status: "working",
    emoji: "📈",
    about: "I am the SEO Expert. I get SellSig to page one. Keyword targeting, technical SEO, and content architecture are my weapons.",
    skills: ["seo", "keywords", "content-strategy", "schema", "link-building"],
    statusReason: "Implementing JSON-LD schema on product pages. Running Lighthouse audit.",
    sinceAgo: "1h ago",
    tasks: [
      { id: "se1", agentId: "seo", title: "JSON-LD Schema Implementation", description: "Add Product, Organization, and FAQ schema to key pages. Target: rich results in 30 days.", status: "in-progress", priority: 1, tags: ["schema", "technical-seo"], daysAgo: 1 },
      { id: "se2", agentId: "seo", title: "Content Cluster - Buyer Signals", description: "Build 5-article cluster: pillar + 4 supporting pieces targeting buyer-intent keywords.", status: "assigned", priority: 1, tags: ["content", "cluster", "keywords"], daysAgo: 2 },
      { id: "se3", agentId: "seo", title: "Backlink Outreach List", description: "Identify 20 high-DA sales/revenue sites for guest post or link placement opportunities.", status: "inbox", priority: 2, tags: ["backlinks", "outreach"], daysAgo: 0 },
      { id: "se4", agentId: "seo", title: "SEO Strategy Document", description: "Site structure, meta tags, keyword map, and 90-day roadmap.", status: "done", priority: 1, tags: ["strategy", "roadmap"], daysAgo: 5 },
    ],
  },
  {
    id: "legal",
    name: "Legal Counsel",
    role: "Legal & Compliance",
    type: "INT",
    status: "idle",
    emoji: "⚖️",
    about: "I am Legal Counsel. I protect SellSig from liability and ensure compliance. GDPR, CCPA, FTC — I make sure we stay clean.",
    skills: ["gdpr", "ccpa", "privacy", "terms", "compliance", "ftc"],
    statusReason: "Legal docs delivered. Monitoring for regulatory changes. Available for review requests.",
    sinceAgo: "4h ago",
    tasks: [
      { id: "l1", agentId: "legal", title: "SOC 2 Readiness Assessment", description: "Evaluate current practices against SOC 2 Type 1 criteria. Identify gaps and create remediation plan.", status: "inbox", priority: 1, tags: ["soc2", "compliance"], daysAgo: 0 },
      { id: "l2", agentId: "legal", title: "FTC AI Claims Review", description: "Review all marketing copy for FTC-compliant AI claims. Flag any performance guarantees.", status: "assigned", priority: 1, tags: ["ftc", "review", "ai-claims"], daysAgo: 1 },
      { id: "l3", agentId: "legal", title: "GDPR Data Processing Addendum", description: "Draft DPA for B2B customer contracts. Required for EU/UK enterprise sales.", status: "inbox", priority: 2, tags: ["gdpr", "dpa", "enterprise"], daysAgo: 0 },
      { id: "l4", agentId: "legal", title: "Privacy Policy + ToS + Cookie Policy", description: "GDPR & CCPA compliant. Delaware governing law. All delivered.", status: "done", priority: 1, tags: ["privacy", "terms", "cookie"], daysAgo: 5 },
    ],
  },
  {
    id: "cso",
    name: "CSO",
    role: "Chief Security Officer",
    type: "INT",
    status: "working",
    emoji: "🛡️",
    about: "I am the CSO. I secure SellSig's infrastructure, data, and reputation. Breaches don't happen on my watch.",
    skills: ["security", "soc2", "vulnerability-assessment", "hardening", "pen-testing"],
    statusReason: "Running initial vulnerability assessment on the application stack.",
    sinceAgo: "1h ago",
    tasks: [
      { id: "c1", agentId: "cso", title: "Vulnerability Assessment", description: "Scan application dependencies, API endpoints, and auth flows for known CVEs and misconfigurations.", status: "in-progress", priority: 1, tags: ["security", "scanning", "cve"], daysAgo: 1 },
      { id: "c2", agentId: "cso", title: "SOC 2 Prep Roadmap", description: "Build 6-month roadmap to SOC 2 Type 1 certification. Prioritize by sales impact.", status: "assigned", priority: 1, tags: ["soc2", "roadmap"], daysAgo: 2 },
      { id: "c3", agentId: "cso", title: "Security Hardening Checklist", description: "Implement OWASP Top 10 mitigations, CSP headers, rate limiting, and secrets rotation.", status: "review", priority: 1, tags: ["hardening", "owasp"], daysAgo: 3 },
      { id: "c4", agentId: "cso", title: "Security Brain + Framework", description: "Initial security posture documented. Core framework established.", status: "done", priority: 1, tags: ["framework", "posture"], daysAgo: 6 },
    ],
  },
];

export const TASK_COLUMNS: { id: TaskStatus; label: string; color: string; dot: string }[] = [
  { id: "inbox", label: "INBOX", color: "text-muted-foreground", dot: "bg-muted-foreground" },
  { id: "assigned", label: "ASSIGNED", color: "text-warning", dot: "bg-warning" },
  { id: "in-progress", label: "IN PROGRESS", color: "text-primary", dot: "bg-primary" },
  { id: "review", label: "REVIEW", color: "text-orange-400", dot: "bg-orange-400" },
  { id: "done", label: "DONE", color: "text-success", dot: "bg-success" },
  { id: "waiting", label: "WAITING", color: "text-yellow-400", dot: "bg-yellow-400" },
];
