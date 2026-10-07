import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";

type Consultation = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
};

export const LatestConsultationSection = () => {
  const { user } = useAuth();
  const [latest, setLatest] = useState<Consultation | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("consultations")
      .select("id, subject, status, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setLatest(data as Consultation);
      });
  }, [user]);

  if (!latest) return null;

  const formatStatus = (s: string) => {
    if (s === "in_progress" || s === "accepted") return "In progress";
    if (s === "pending") return "Pending";
    if (s === "completed" || s === "resolved") return "Completed";
    if (s === "rejected") return "Rejected";
    return s;
  };

  const getBadgeVariant = (s: string) => {
    if (s === "completed" || s === "resolved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <section className="container my-6">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
        YOUR LATEST CONSULTATION
      </p>
      <Link
        to="/consultations"
        className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md"
      >
        <div>
          <h3 className="font-semibold text-base text-foreground">{latest.subject}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Booked on {new Date(latest.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant(latest.status)} className="capitalize text-xs">
            {formatStatus(latest.status)}
          </Badge>
          <ChevronRight size={18} className="text-muted-foreground" />
        </div>
      </Link>
    </section>
  );
};
