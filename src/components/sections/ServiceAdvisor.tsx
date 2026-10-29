import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, CheckCircle2, Loader2, Sparkles } from "lucide-react";

const REAL_SUPABASE_URL = "https://jyjuifmmruytnsvjyghl.supabase.co";
const FN_URL = `${REAL_SUPABASE_URL}/functions/v1/recommend-service`;
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5anVpZm1tcnV5dG5zdmp5Z2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjM3NjUsImV4cCI6MjA5NDM5OTc2NX0.rY0W2_YI3b0d0E5I47rmBnPgdiAsAPp2Nu9LvKSM4tY";

type Svc = { id: string; title: string; description: string };
type Result = { service: Svc; reason: string; checklist: string[] };

const getSmartRecommendation = (query: string, availableServices: Svc[]): Result => {
  const q = query.toLowerCase();

  let matchedTitle = "IT Support & Troubleshooting";
  let reason = "Based on your description, an IT Support technician can diagnose hardware, software, or speed issues.";

  if (q.includes("consult") || q.includes("review") || q.includes("strategy") || q.includes("vendor") || q.includes("choice") || q.includes("buy")) {
    matchedTitle = "Technical Consulting";
    reason = "We recommend a Technical Consulting session to review your systems, requirements, and provide tailored expert recommendations.";
  } else if (q.includes("data") || q.includes("excel") || q.includes("software") || q.includes("app") || q.includes("install") || q.includes("automation") || q.includes("report")) {
    matchedTitle = "Data & Software Support";
    reason = "We recommend Data & Software Support to optimize your software tools, fix freezes, and handle workflow setup.";
  } else if (q.includes("wifi") || q.includes("network") || q.includes("router") || q.includes("internet") || q.includes("slow net") || q.includes("security") || q.includes("firewall")) {
    matchedTitle = "Network Setup & Security";
    reason = "We recommend Network Setup & Security to audit your network, fix connection drops, and secure your router/firewall.";
  } else if (q.includes("cloud") || q.includes("aws") || q.includes("azure") || q.includes("backup") || q.includes("migration") || q.includes("drive")) {
    matchedTitle = "Cloud Migration & Management";
    reason = "We recommend Cloud Migration & Management for cloud setup, backup strategy, and remote data management.";
  } else if (q.includes("process") || q.includes("workflow") || q.includes("integrate") || q.includes("automation") || q.includes("pos")) {
    matchedTitle = "Business Process Automation";
    reason = "We recommend Business Process Automation to streamline your operations and connect your tools.";
  } else if (q.includes("screen") || q.includes("laptop") || q.includes("freeze") || q.includes("slow") || q.includes("broken") || q.includes("repair") || q.includes("hardware")) {
    matchedTitle = "IT Support & Troubleshooting";
    reason = "We recommend IT Support & Troubleshooting to diagnose and fix hardware glitches, performance freezes, or component replacements.";
  }

  const matchedSvc = availableServices.find(s => s.title.toLowerCase().includes(matchedTitle.toLowerCase())) ||
    availableServices[1] || availableServices[0] || { id: "default-2", title: matchedTitle, description: reason };

  return {
    service: matchedSvc,
    reason,
    checklist: [
      "Save your open work",
      "Note when the problem started",
      "Have your charger ready"
    ]
  };
};

const ServiceAdvisor = ({ services }: { services: Svc[] }) => {
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const ask = async () => {
    setBusy(true);
    setResult(null);

    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ problem, services: services.map(({ id, title, description }) => ({ id, title, description })) }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setBusy(false);
        return;
      }
    } catch (e) {
      console.warn("Edge function unavailable, using local smart advisor fallback", e);
    }

    // Instant local recommendation fallback
    setTimeout(() => {
      const localResult = getSmartRecommendation(problem, services);
      setResult(localResult);
      setBusy(false);
    }, 350);
  };

  const bookUrl = result
    ? `/book?service=${encodeURIComponent(result.service.title)}&service_id=${result.service.id}&details=${encodeURIComponent(problem)}`
    : "";

  return (
    <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-accent/20 bg-card p-4 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent"><Bot size={20} /></span>
        <h2 className="text-base sm:text-lg font-bold text-foreground">Not sure what you need?</h2>
      </div>
      <p className="mb-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        Describe your problem and our AI helper will suggest the right service and what to prepare.
      </p>
      <Textarea
        rows={4}
        maxLength={2000}
        placeholder="e.g. My laptop is very slow and keeps freezing when I open Excel"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        className="text-xs sm:text-sm"
      />
      <Button variant="accent" className="mt-3 w-full font-bold" onClick={ask} disabled={busy || problem.trim().length < 5}>
        {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...</> : <><Sparkles size={16} className="mr-1.5" /> Get a recommendation</>}
      </Button>

      {result && (
        <div className="mt-4 space-y-3 rounded-xl bg-accent/10 border border-accent/20 p-4 sm:p-5 animate-fade-in">
          <p className="text-[10px] uppercase font-bold tracking-wider text-accent">WE RECOMMEND</p>
          <p className="text-base sm:text-lg font-extrabold text-foreground">{result.service.title}</p>
          {result.reason && <p className="text-xs sm:text-sm text-muted-foreground">{result.reason}</p>}

          <div className="pt-2 border-t border-border/60">
            <p className="mb-2 text-xs font-bold text-foreground">Before you book</p>
            <ul className="space-y-1.5 text-xs text-foreground/90">
              {(result.checklist.length > 0 ? result.checklist : [
                "Save your open work",
                "Note when the problem started",
                "Have your charger ready"
              ]).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <Link to={bookUrl} className={cn(buttonVariants({ variant: "accent" }), "w-full font-bold gap-1 mt-2")}>
            Let's Get Started! →
          </Link>
          <p className="text-[10px] text-muted-foreground italic text-center">A suggestion to help you choose, not a diagnosis.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceAdvisor;
