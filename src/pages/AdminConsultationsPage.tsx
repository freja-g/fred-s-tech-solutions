import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Clock, Image as ImageIcon, RefreshCw, MessageSquare, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PayDialog from "@/components/payments/PayDialog";
import { formatKES } from "@/lib/staff";

const APP_TYPE = import.meta.env.VITE_APP_TYPE || "user";

const AdminConsultationsPage = () => {
  const { user, loading, isAdmin, isTechnician } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [logForm, setLogForm] = useState({ diagnostics: "", parts: "", notes: "", cost: "0" });
  const [rejectReason, setRejectReason] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Rate job dialog
  const [rateConsultation, setRateConsultation] = useState<any>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewBody, setReviewBody] = useState("");

  const isStaffPortal = APP_TYPE === "tech";
  const isStaff = isStaffPortal && (isAdmin || isTechnician);

  const cacheKey = `cached_consultations_${user?.id || "guest"}`;

  const fetchConsultations = async () => {
    if (loading) return;
    setRefreshing(true);

    // Load cached consultations first for instant offline access
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setConsultations(JSON.parse(cached)); } catch {}
    }

    try {
      let query = supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isStaff || !isStaffPortal) {
        if (user) query = query.eq("customer_id", user.id);
        else { setRefreshing(false); return; }
      }

      const { data, error } = await query;

      if (error) {
        console.warn("Consultation fetch offline/error:", error);
        setRefreshing(false);
        return;
      }

      const list = data || [];
      if (list.length === 0) {
        setConsultations([]);
        try { localStorage.setItem(cacheKey, JSON.stringify([])); } catch {}
        setRefreshing(false);
        return;
      }

      const customerIds = Array.from(new Set(list.map((c: any) => c.customer_id)));
      const serviceIds = Array.from(new Set(list.filter((c: any) => c.service_id).map((c: any) => c.service_id)));

      const [{ data: profiles }, { data: services }] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, email").in("user_id", customerIds),
        serviceIds.length > 0
          ? supabase.from("services").select("id, title").in("id", serviceIds)
          : Promise.resolve({ data: [] })
      ]);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      const serviceMap = new Map((services || []).map((s: any) => [s.id, s]));

      const fullList = list.map((c: any) => ({
        ...c,
        profiles: profileMap.get(c.customer_id),
        services: c.service_id ? serviceMap.get(c.service_id) : null
      }));

      setConsultations(fullList);
      try { localStorage.setItem(cacheKey, JSON.stringify(fullList)); } catch {}
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTechnicians = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "technician");

    if (roles) {
      const ids = roles.map(r => r.user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);
      setTechnicians(profs || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConsultations();
      if (isStaff) fetchTechnicians();
    }
  }, [user, isStaff]);

  const handleUpdateStatus = async (id: string, status: string, extra: Record<string, any> = {}) => {
    const { error } = await supabase
      .from("consultations")
      .update({ status, ...extra })
      .eq("id", id);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Consultation updated" });
      fetchConsultations();
    }
  };

  const handleAccept = (id: string) =>
    handleUpdateStatus(id, "accepted", { technician_id: user?.id, assigned_at: new Date().toISOString() });

  const handleReject = async (id: string) => {
    if (!rejectReason) return;
    await handleUpdateStatus(id, "rejected", { rejected_reason: rejectReason });
    setRejectReason("");
  };

  const handleReassign = async (id: string, newTechId: string) => {
    await handleUpdateStatus(id, "accepted", { technician_id: newTechId, assigned_at: new Date().toISOString() });
  };

  const handleCompleteJob = async () => {
    if (!selectedConsultation) return;
    await handleUpdateStatus(selectedConsultation.id, "completed", {
      diagnostics: logForm.diagnostics,
      job_notes: logForm.notes,
      cost: parseFloat(logForm.cost),
      completed_at: new Date().toISOString()
    });
    setSelectedConsultation(null);
    setLogForm({ diagnostics: "", parts: "", notes: "", cost: "0" });
  };

  const handleSubmitReview = async () => {
    if (!user || !rateConsultation || !reviewBody.trim()) return;
    const { data: profile } = await supabase
      .from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      author_name: profile?.display_name || user.email?.split("@")[0] || "Customer",
      author_role: "Customer",
      rating: ratingVal,
      title: rateConsultation.subject,
      body: reviewBody.trim(),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted", description: "Thank you for your feedback!" });
      setRateConsultation(null);
      setReviewBody("");
    }
  };

  if (loading || !user) return null;

  const groups = {
    all: consultations,
    pending: consultations.filter(c => c.status === 'pending'),
    in_progress: consultations.filter(c => c.status === 'accepted' || c.status === 'in_progress'),
    completed: consultations.filter(c => c.status === 'completed' || c.status === 'resolved'),
  };

  const formatBadgeStatus = (status: string) => {
    if (status === "completed" || status === "resolved") return "Completed";
    if (status === "accepted" || status === "in_progress") return "In progress";
    if (status === "pending") return "Pending";
    if (status === "rejected") return "Rejected";
    return status;
  };

  const renderCard = (c: any) => {
    const isCompleted = c.status === "completed" || c.status === "resolved";
    const isInProgress = c.status === "accepted" || c.status === "in_progress";
    const isPending = c.status === "pending";

    return (
      <Card key={c.id} className="border border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-2 p-4 sm:p-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base sm:text-lg font-bold">
                {c.subject || c.services?.title}
              </CardTitle>
              <Badge variant={isCompleted ? "default" : c.status === "rejected" ? "destructive" : "secondary"} className="capitalize">
                {formatBadgeStatus(c.status)}
              </Badge>
            </div>
            {c.delivery_method && (
              <p className="text-xs text-muted-foreground capitalize">
                Delivery: {String(c.delivery_method).replace("_", "-")}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0 space-y-3">
          {c.description && <p className="text-sm text-foreground/90">{c.description}</p>}

          {/* Payment Notice for Completed Jobs matching Page 4 PDF */}
          {isCompleted && c.payment_status !== "paid" && Number(c.cost) > 0 && !isStaff && (
            <div className="rounded-lg border border-accent/20 bg-accent/10 p-3 text-xs sm:text-sm">
              <p className="font-semibold text-accent mb-2">Payment due. Pay with M-Pesa.</p>
              <div className="flex flex-wrap gap-2">
                <PayDialog
                  consultationId={c.id}
                  amount={Number(c.cost)}
                  defaultPhone={c.phone || ""}
                  onPaid={fetchConsultations}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRateConsultation(c)}
                >
                  <Star size={14} className="mr-1.5 text-accent" /> Rate this job
                </Button>
              </div>
            </div>
          )}

          {isCompleted && c.payment_status === "paid" && (
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
              <span>Paid with M-Pesa</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setRateConsultation(c)}
              >
                <Star size={12} className="mr-1 text-accent" /> Rate this job
              </Button>
            </div>
          )}

          {/* Message about this consultation link matching PDF */}
          <div className="pt-1">
            <Link
              to={`/messages`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <MessageSquare size={14} />
              Message about this consultation
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderList = (items: any[]) => (
    <div className="grid gap-4">
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">No consultations found.</p>
      ) : (
        items.map(renderCard)
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 container max-w-3xl py-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Consultations</h1>
          <Button variant="ghost" size="icon" onClick={fetchConsultations} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Filter Tabs matching Page 4 PDF: All | Pending | In progress | Completed */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="all" className="text-[10px] sm:text-xs px-1 truncate min-w-0">All ({groups.all.length})</TabsTrigger>
            <TabsTrigger value="pending" className="text-[10px] sm:text-xs px-1 truncate min-w-0">Pending ({groups.pending.length})</TabsTrigger>
            <TabsTrigger value="in_progress" className="text-[10px] sm:text-xs px-1 truncate min-w-0">In progress ({groups.in_progress.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-[10px] sm:text-xs px-1 truncate min-w-0">Completed ({groups.completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderList(groups.all)}</TabsContent>
          <TabsContent value="pending">{renderList(groups.pending)}</TabsContent>
          <TabsContent value="in_progress">{renderList(groups.in_progress)}</TabsContent>
          <TabsContent value="completed">{renderList(groups.completed)}</TabsContent>
        </Tabs>

        {/* Rating Dialog */}
        {rateConsultation && (
          <Dialog open={!!rateConsultation} onOpenChange={() => setRateConsultation(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rate this job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>Rating</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRatingVal(num)}
                        className="p-1"
                      >
                        <Star className={`w-8 h-8 ${num <= ratingVal ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Feedback</Label>
                  <Textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="How was your experience with GiCOFix?"
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRateConsultation(null)}>
                  Cancel
                </Button>
                <Button variant="accent" onClick={handleSubmitReview} disabled={!reviewBody.trim()}>
                  Submit Rating
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default AdminConsultationsPage;
