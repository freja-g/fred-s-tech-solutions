import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase as _sb } from "@/integrations/supabase/client";
import { ArrowLeft, MessageSquare, CheckCircle, Clock, Video, Image as ImageIcon, ShieldCheck } from "lucide-react";

const supabase: any = _sb;

const ConsultationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isTechnician, loading } = useAuth();
  const { toast } = useToast();

  const [item, setItem] = useState<any>(null);
  const [customerName, setCustomerName] = useState<string>("Customer");
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setFetching(true);
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast({ title: "Not found", description: "Consultation not found", variant: "destructive" });
      setFetching(false);
      return;
    }

    setItem(data);

    if (data.customer_id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("user_id", data.customer_id)
        .maybeSingle();

      if (prof?.display_name) setCustomerName(prof.display_name);
      else if (prof?.email) setCustomerName(prof.email.split("@")[0]);
    }

    setFetching(false);
  };

  useEffect(() => {
    if (!loading) fetchDetail();
  }, [id, loading]);

  const handleMarkResolved = async () => {
    if (!item) return;
    setUpdating(true);
    const { error } = await supabase
      .from("consultations")
      .update({
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", item.id);

    setUpdating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resolved", description: "Consultation marked as resolved" });
      fetchDetail();
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 sm:pt-28 px-4 container max-w-xl text-center py-12">
          <p className="text-muted-foreground animate-pulse">Loading consultation details...</p>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 sm:pt-28 px-4 container max-w-xl text-center py-12 space-y-4">
          <p className="text-muted-foreground">Consultation not found.</p>
          <Button variant="outline" onClick={() => navigate("/admin/consultations")}>
            Back to Consultations
          </Button>
        </main>
      </div>
    );
  }

  const isCompleted = item.status === "completed" || item.status === "resolved";
  const isInProgress = item.status === "accepted" || item.status === "in_progress";
  const isPaid = item.payment_status === "paid";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 container max-w-2xl py-6 space-y-6">
        {/* Back Link matching Page 3 PDF: ← Consultations */}
        <div>
          <button
            onClick={() => navigate("/admin/consultations")}
            className="inline-flex items-center text-xs font-bold text-accent hover:underline gap-1 mb-2"
          >
            <ArrowLeft size={14} /> Consultations
          </button>
        </div>

        {/* Header & Status matching Page 3 PDF */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{item.subject || "Consultation"}</h1>
          </div>
          <Badge
            variant={isCompleted ? "default" : "secondary"}
            className="text-xs px-3 py-1 font-bold capitalize shrink-0"
          >
            {isCompleted ? "Completed" : isInProgress ? "In Progress" : item.status}
          </Badge>
        </div>

        {/* Section 1: CUSTOMER */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CUSTOMER</p>
          <p className="text-base font-bold text-foreground">{customerName}</p>
        </div>

        {/* Section 2: DELIVERY METHOD */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">DELIVERY METHOD</p>
          <p className="text-sm font-semibold text-foreground capitalize">
            {item.delivery_method ? String(item.delivery_method).replace("_", " ") : "Doorstep"}
          </p>
        </div>

        {/* Section 3: PROBLEM DESCRIPTION */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PROBLEM DESCRIPTION</p>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {item.description || "No description provided."}
          </p>
        </div>

        {/* Section 4: ATTACHMENTS */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ATTACHMENTS</p>
          {item.media_url ? (
            <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border bg-secondary">
              {/\.(mp4|webm|mov)(?:\?|#|$)/i.test(item.media_url) ? (
                <video src={item.media_url} controls className="w-full h-full object-cover" />
              ) : (
                <img src={item.media_url} alt="Attachment" className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No media attachments uploaded.</p>
          )}
        </div>

        {/* Section 5: PAYMENT */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PAYMENT</p>
          {isPaid ? (
            <p className="text-sm font-bold text-green-500 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Paid · M-Pesa receipt {item.mpesa_receipt || "[Confirmed]"}
            </p>
          ) : (
            <p className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
              <Clock size={16} /> Awaiting payment
            </p>
          )}
        </div>

        {/* Actions matching Page 3 PDF: Message customer | Mark resolved */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full font-bold"
            onClick={() => navigate(`/admin/messages?customer=${item.customer_id}`)}
          >
            <MessageSquare size={16} className="mr-2 text-accent" /> Message customer
          </Button>

          {!isCompleted ? (
            <Button
              variant="accent"
              className="w-full font-bold"
              onClick={handleMarkResolved}
              disabled={updating}
            >
              <CheckCircle size={16} className="mr-2" /> Mark resolved
            </Button>
          ) : (
            <Button variant="secondary" className="w-full font-bold" disabled>
              <CheckCircle size={16} className="mr-2 text-green-500" /> Resolved
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConsultationDetailPage;
