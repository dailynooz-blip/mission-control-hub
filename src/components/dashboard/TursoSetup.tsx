import { useState } from "react";
import { saveCredentials, isTursoConfigured } from "@/lib/tursoConfig";
import { tursoQuery, runSchema } from "@/lib/turso";

type Step = "idle" | "testing" | "schema" | "done" | "error";

interface StepStatus {
  label: string;
  state: "pending" | "running" | "done" | "error";
  detail?: string;
}

export default function TursoSetup({ onConnected }: { onConnected: () => void }) {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepStatus[]>([
    { label: "Test connection", state: "pending" },
    { label: "Apply schema & triggers", state: "pending" },
    { label: "Seed agents", state: "pending" },
  ]);

  const setStepState = (
    index: number,
    state: StepStatus["state"],
    detail?: string
  ) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, state, detail } : s))
    );
  };

  const normalizeUrl = (raw: string) =>
    raw.trim().replace(/^libsql:\/\//, "https://").replace(/\/$/, "");

  const handleInit = async () => {
    setError(null);
    const cleanUrl = normalizeUrl(url);
    const cleanToken = token.trim();

    if (!cleanUrl || !cleanToken) {
      setError("Please enter both the Database URL and Auth Token.");
      return;
    }

    // Reset steps
    setSteps([
      { label: "Test connection", state: "pending" },
      { label: "Apply schema & triggers", state: "pending" },
      { label: "Seed agents", state: "pending" },
    ]);
    setStep("testing");

    // Step 1: Test connection
    setStepState(0, "running");
    try {
      await tursoQuery("SELECT 1", [], cleanUrl, cleanToken);
      setStepState(0, "done", "Connection OK");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStepState(0, "error", msg);
      setError(`Connection failed: ${msg}`);
      setStep("error");
      return;
    }

    // Step 2: Run schema
    setStep("schema");
    setStepState(1, "running");
    try {
      await runSchema(cleanUrl, cleanToken);
      setStepState(1, "done", "All tables, indexes and triggers created");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStepState(1, "error", msg);
      setError(`Schema failed: ${msg}`);
      setStep("error");
      return;
    }

    // Step 3: Verify agents seeded
    setStepState(2, "running");
    try {
      const result = await tursoQuery(
        "SELECT COUNT(*) as cnt FROM agents",
        [],
        cleanUrl,
        cleanToken
      );
      const count = result.rows?.[0]?.[0] ?? 0;
      setStepState(2, "done", `${count} agents ready`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStepState(2, "error", msg);
      setError(`Agent check failed: ${msg}`);
      setStep("error");
      return;
    }

    // All good — save and reload
    saveCredentials(cleanUrl, cleanToken);
    setStep("done");
  };

  const handleGoToDashboard = () => {
    onConnected();
    window.location.reload();
  };

  const stepIcon = (state: StepStatus["state"]) => {
    if (state === "pending") return <span className="text-muted-foreground">○</span>;
    if (state === "running") return <span className="animate-spin inline-block">⟳</span>;
    if (state === "done") return <span className="text-primary">✓</span>;
    return <span className="text-destructive">✗</span>;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🗄️</div>
          <h1 className="text-2xl font-bold text-foreground">Connect Turso</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Paste your Turso database URL and auth token to initialize the
            OpenClaw state layer. No CLI needed.
          </p>
        </div>

        <div className="bg-surface-card rounded-xl p-6 border border-border space-y-4">
          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Database URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-db-xxxxx.turso.io"
              disabled={step !== "idle" && step !== "error"}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use <code className="bg-secondary px-1 rounded">https://</code> — not{" "}
              <code className="bg-secondary px-1 rounded">libsql://</code> (auto-corrected)
            </p>
          </div>

          {/* Token */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Auth Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGci..."
              disabled={step !== "idle" && step !== "error"}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          {/* Steps progress */}
          {step !== "idle" && (
            <div className="border border-border rounded-lg p-4 space-y-2 bg-background">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 w-4 text-center shrink-0">
                    {stepIcon(s.state)}
                  </span>
                  <div>
                    <span
                      className={
                        s.state === "done"
                          ? "text-foreground"
                          : s.state === "error"
                          ? "text-destructive"
                          : s.state === "running"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {s.label}
                    </span>
                    {s.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Actions */}
          {step === "done" ? (
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-primary/80 hover:bg-primary text-primary-foreground font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              ✓ Connected — Go to Dashboard
            </button>
          ) : (
            <button
              onClick={step === "error" ? () => { setStep("idle"); setError(null); } : handleInit}
              disabled={step !== "idle" && step !== "error"}
              className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === "error"
                ? "Try Again"
                : step === "idle"
                ? "Initialize Database"
                : "Initializing…"}
            </button>
          )}
        </div>

        {/* Footer help */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Don't have a Turso account?{" "}
          <a
            href="https://turso.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            Sign up free →
          </a>
          {" "}Create a DB called <code className="bg-secondary px-1 rounded">openclaw-state</code> and paste your URL + token above.
        </p>
      </div>
    </div>
  );
}
