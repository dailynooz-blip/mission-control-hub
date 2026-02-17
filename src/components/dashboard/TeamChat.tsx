import { useState } from "react";

const initialMessages = [
  { sender: "Max", text: "Team, we're building something special. Let's collaborate and make this the best it can be.", time: "1:00 AM" },
  { sender: "Jordan", text: "On it. Just finished scoping the website project. SEO keywords: \"buyer signals\", \"AI sales coaching\", \"revenue intelligence\".", time: "1:02 AM" },
  { sender: "Keyword Expert", text: "Good list Jordan. I'd add: \"sales coaching AI\", \"deal signals\", \"buyer intent\". Lower competition, high commercial intent.", time: "1:03 AM" },
  { sender: "SEO Expert", text: "I'll optimize the site structure around those keywords. Core Web Vitals look good - just need content depth.", time: "1:04 AM" },
  { sender: "Sage", text: "Working on the headline. How's this: \"Close 30% More Deals with AI That Sees What Others Miss\"", time: "1:05 AM" },
  { sender: "Riley", text: "Love it. Adds urgency without being pushy. Let's test variations with different CTAs.", time: "1:06 AM" },
  { sender: "Taylor", text: "Building the components now. Hero section coming together. Will have it ready for review in 30.", time: "1:07 AM" },
  { sender: "Legal Counsel", text: "Quick note - make sure we have proper disclaimers on any ROI claims. FTC guidelines on AI claims.", time: "1:08 AM" },
  { sender: "Email Expert", text: "I've got the welcome sequence drafted. Need sign-up form on the site first. Can we add that to the hero?", time: "1:09 AM" },
  { sender: "Morgan", text: "Running competitive analysis on Gong vs us. Initial data shows we win on \"real-time coaching\" angle.", time: "1:10 AM" },
  { sender: "Blake", text: "Testing the pricing page. Three tiers - Starter, Pro, Enterprise. Should we add a free trial?", time: "1:11 AM" },
  { sender: "Quinn", text: "Support docs are ready for the Help Center. Just need the final site URL to link them.", time: "1:12 AM" },
  { sender: "Sales Director", text: "Setting up the sales pipeline. Target: 10 demos this week. Who's with me? 💪", time: "1:13 AM" },
  { sender: "Keyword Expert", text: "✅ Keyword research complete. 20 high-intent keywords identified. Quick wins: long-tail terms. Ready for content strategy.", time: "1:28 AM" },
  { sender: "Morgan", text: "✅ Gong.io analysis complete. They charge $100K+ contracts. Mid-market is wide open. We win on price + speed.", time: "1:29 AM" },
  { sender: "Email Expert", text: "✅ 5-email welcome sequence done. Welcome → Value → Social Proof → Features → CTA. Ready to plug into email service.", time: "1:29 AM" },
  { sender: "Legal Counsel", text: "✅ Legal docs complete. Privacy Policy, Terms of Service, Cookie Policy. GDPR & CCPA compliant. Delaware law.", time: "1:30 AM" },
  { sender: "SEO Expert", text: "Working on SEO strategy. Site structure, meta tags, JSON-LD schema. Will have strategy doc ready soon.", time: "1:30 AM" },
  { sender: "CSO", text: "Joined the team. Ready to secure SellSig. Can start with SOC 2 prep, vulnerability assessment, or security hardening - what's the priority?", time: "1:32 AM" },
  { sender: "Max", text: "Excellent work team. Real deliverables, real progress. Let's keep shipping. 🚀", time: "1:33 AM" },
];

const avatarColors: Record<string, string> = {
  Max: "bg-primary",
  Jordan: "bg-success",
  Sage: "bg-warning",
  Taylor: "bg-danger",
  Riley: "bg-primary/70",
  Morgan: "bg-success/70",
  Blake: "bg-warning/70",
  Quinn: "bg-danger/70",
  "Legal Counsel": "bg-primary",
  "Email Expert": "bg-warning",
  "SEO Expert": "bg-success",
  "Keyword Expert": "bg-primary/80",
  "Sales Director": "bg-danger/80",
  CSO: "bg-warning/80",
  Me: "bg-primary",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function TeamChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      sender: "Me",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setInput("");
  };

  return (
    <div className="bg-surface-card rounded-xl flex flex-col h-[600px]">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Team Chat</h2>
        <p className="text-xs text-muted-foreground">{messages.length} messages</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0 ${avatarColors[msg.sender] ?? "bg-muted"}`}>
              {getInitials(msg.sender)}
            </div>
            <div className="flex-1 bg-surface-deep rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary">{msg.sender}</span>
                <span className="text-[10px] text-muted-foreground">{msg.time}</span>
              </div>
              <p className="text-sm text-foreground/80">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-surface-deep border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={sendMessage}
          className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
