import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, CheckCircle2, Loader2 } from "lucide-react";

const FN_URL = "https://ukazdcrfylddxmbzkpfq.supabase.co/functions/v1/recommend-service";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYXpkY3JmeWxkZHhtYnprcGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDM0MzQsImV4cCI6MjA4MzUxOTQzNH0.zZwLkqeUy0GV_PptTmqK3V3zaWyP25rmBiqaHWNjyII";

type Svc = { id: string; title: string; description: string };
type Result = { service: Svc; reason: string; checklist: string[] };

const ServiceAdvisor = ({ services }: { services: Svc[] }) => {
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const ask = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ problem, services: services.map(({ id, title, description }) => ({ id, title, description })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const bookUrl = result
    ? `/book?service=${encodeURIComponent(result.service.title)}&service_id=${result.service.id}&details=${encodeURIComponent(problem)}`
    : "";

  return (
    <div className="mx-auto mb-10 max-w-2xl rounded-xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent"><Bot size={18} /></span>
        <h2 className="text-lg font-semibold">Not sure what you need?</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">Describe your problem and our AI-powered helper will suggest the right service and what to prepare.</p>
      <Textarea
        rows={4}
        maxLength={2000}
        placeholder="e.g. My laptop is very slow and keeps freezing when I open Excel"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />
      <Button variant="accent" className="mt-3 w-full" onClick={ask} disabled={busy || problem.trim().length < 10}>
        {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...</> : "Get a recommendation"}
      </Button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {result && (
        <div className="mt-4 space-y-3 rounded-lg bg-secondary/60 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended service</p>
          <p className="text-base font-semibold">{result.service.title}</p>
          {result.reason && <p className="text-sm">{result.reason}</p>}
          {result.checklist.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Before we start, please prepare:</p>
              <ul className="space-y-1.5">
                {result.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link to={bookUrl} className={cn(buttonVariants({ variant: "accent" }), "w-full")}>Book this service</Link>
        </div>
      )}
    </div>
  );
};

export default ServiceAdvisor;
