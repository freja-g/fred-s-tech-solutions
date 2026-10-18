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
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [priceInput, setPriceInput] = useState<string>("");
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
    if (data.price) setPriceInput(String(data.price));

    const pPhone = data.phone || data.description?.match(/\[Phone:\s*(.*?)\]/)?.[1] || "";
    const pAddr = data.address || data.description?.match(/\[Address:\s*(.*?)\]/)?.[1] || "";
    if (pPhone) setCustomerPhone(pPhone);
    if (pAddr) setCustomerAddress(pAddr);

    if (data.customer_id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, email, phone, coverage_zones")
        .eq("user_id", data.customer_id)
        .maybeSingle();

      if (prof?.display_name) setCustomerName(prof.display_name);
      else if (prof?.email) setCustomerName(prof.email.split("@")[0]);

      if (!pPhone && prof?.phone) setCustomerPhone(prof.phone);
      if (!pAddr && prof?.coverage_zones?.length) setCustomerAddress(prof.coverage_zones[0]);
    }

    setFetching(false);
  };

  useEffect(() => {
    if (!loading) fetchDetail();
  }, [id, loading]);

  const handleAcceptConsultation = async () => {
    if (!item || !user) return;
    setUpdating(true);
    const { error } = await supabase
      .from("consultations")
      .update({
        status: "in_progress",
        technician_id: user.id,
      })
      .eq("id", item.id);

    setUpdating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job Accepted!", description: "Customer has been notified that you are working on it." });
      fetchDetail();
    }
  };

  const handleSendInvoice = async () => {
    if (!item || !priceInput.trim()) return;
    setUpdating(true);
    const priceNum = Number(priceInput.trim());
    const { error } = await supabase
      .from("consultations")
      .update({
        price: priceNum,
        payment_status: "due",
      })
      .eq("id", item.id);

    setUpdating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invoice Sent!", description: `Customer prompted to pay KES ${priceNum}.` });
      fetchDetail();
    }
  };

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
      toast({ title: "Resolved", description: "Job marked as completed. Customer notified." });
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

        {/* Section 2: PHONE */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PHONE</p>
            <p className="text-sm font-bold text-foreground">{customerPhone || "Not provided"}</p>
          </div>
          {customerPhone && (
            <a
              href={`tel:${customerPhone}`}
              className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-bold text-xs hover:bg-accent/90 transition-colors"
            >
              Call
            </a>
          )}
        </div>

        {/* Section 3: DELIVERY METHOD */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">DELIVERY METHOD</p>
          <p className="text-sm font-semibold text-foreground capitalize">
            {item.delivery_method ? String(item.delivery_method).replace("_", " ") : "Doorstep"}
          </p>
        </div>

        {/* Section 4: ADDRESS */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ADDRESS</p>
            <p className="text-sm font-medium text-foreground">{customerAddress || "Not provided"}</p>
          </div>
          {customerAddress && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg border border-accent text-accent font-bold text-xs hover:bg-accent/10 transition-colors shrink-0"
            >
              Open map
            </a>
          )}
        </div>

        {/* Section 5: PROBLEM DESCRIPTION */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PROBLEM DESCRIPTION</p>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {item.description || "No description provided."}
          </p>
        </div>

        {/* Section 6: ATTACHMENTS */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ATTACHMENTS</p>
          {item.media_url || item.attachment_urls?.length ? (
            <div className="grid grid-cols-2 gap-2">
              {(item.attachment_urls?.length ? item.attachment_urls : [item.media_url]).map((url: string, i: number) => (
                <div key={i} className="aspect-video w-full rounded-lg overflow-hidden border bg-secondary">
                  {/\.(mp4|webm|mov)(?:\?|#|$)/i.test(url) ? (
                    <video src={url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No media attachments uploaded.</p>
          )}
        </div>

        {/* Section 7: PRICE & INVOICE */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PRICE</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">KES</span>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full pl-12 pr-3 py-2 text-sm rounded-lg border border-border bg-background font-bold text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <Button
              size="sm"
              variant="accent"
              className="font-bold text-xs h-10 px-4"
              onClick={handleSendInvoice}
              disabled={updating || !priceInput.trim()}
            >
              Send invoice
            </Button>
          </div>
        </div>

        {/* Section 8: PAYMENT */}
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

        {/* Actions matching Staff App Design 1.1 Page 3 & Page 8 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {item.status === "pending" && (
            <Button
              variant="accent"
              className="w-full font-bold"
              onClick={handleAcceptConsultation}
              disabled={updating}
            >
              Accept consultation
            </Button>
          )}

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
