import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const supabase = supabaseClient as any;

type Latest = { subject: string; status: string };

const LatestConsultation = () => {
  const { user } = useAuth();
  const [latest, setLatest] = useState<Latest | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("consultations").select("subject, status").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }: { data: Latest | null }) => setLatest(data));
  }, [user]);

  if (!latest) return null;
  const label = latest.status === "accepted" || latest.status === "in_progress" ? "In progress" : latest.status === "resolved" ? "Completed" : latest.status;

  return (
    <div className="container max-w-4xl pt-5">
      <Link to="/consultations" className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your latest consultation</p>
          <p className="truncate font-semibold">{latest.subject}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/15 px-3 py-2 text-xs font-semibold capitalize text-accent">{label}</span>
      </Link>
    </div>
  );
};

export default LatestConsultation;