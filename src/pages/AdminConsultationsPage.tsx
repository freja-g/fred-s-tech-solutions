
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Clock, ExternalLink, Image as ImageIcon, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // In the User App (WIGA TECH), NO ONE sees other people's consultations.
  // In the Staff App (WIGA STAFF), admins/technicians see everything.
  const isStaffPortal = APP_TYPE === "tech";
  const isStaff = isStaffPortal && (isAdmin || isTechnician);

  const fetchConsultations = async () => {
    if (loading) return;
    setRefreshing(true);
    try {
      let query = supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });

      // If we are NOT in the staff portal, OR we are not staff, only show own consultations.
      if (!isStaff || !isStaffPortal) {
        if (user) query = query.eq("customer_id", user.id);
      }

      const { data, error } = await query;
      // ... rest of logic remains same

      if (error) {
        console.error("Consultation fetch error:", error);
        toast({ title: "Fetch failed", description: error.message, variant: "destructive" });
        return;
      }

      const list = data || [];
      if (list.length === 0) {
        setConsultations([]);
        return;
      }

      // Manually join profiles and services since auto-relationship might be missing
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

      setConsultations(list.map((c: any) => ({
        ...c,
        profiles: profileMap.get(c.customer_id),
        services: c.service_id ? serviceMap.get(c.service_id) : null
      })));
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
      const label =
        status === "accepted" ? "Accepted — you are assigned to this request." :
        status === "completed" ? "Marked as completed. 🎉" :
        status === "rejected" ? "Consultation rejected." :
        "Updated.";
      toast({ title: "Consultation updated", description: label });
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

  if (loading || !user) return null;

  const groups = {
    pending: consultations.filter(c => c.status === 'pending'),
    active: consultations.filter(c => c.status === 'accepted' || c.status === 'in_progress'),
    completed: consultations.filter(c => c.status === 'completed' || c.status === 'resolved'),
    rejected: consultations.filter(c => c.status === 'rejected'),
  };

  const renderCard = (c: any) => (
    <Card key={c.id}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle>{c.services?.title || c.subject}</CardTitle>
            <Badge variant={c.status === 'pending' ? 'outline' : c.status === 'rejected' ? 'destructive' : 'default'}>
              {c.status}
            </Badge>
          </div>
          {c.services?.title && c.subject && c.subject !== c.services.title && (
            <CardDescription className="font-medium text-foreground/80">
              {c.subject}
            </CardDescription>
          )}
          <CardDescription>
            {isStaff ? (
              <>From: {c.profiles?.display_name || "Unknown"} ({c.profiles?.email})</>
            ) : (
              <>Requested on {new Date(c.created_at).toLocaleDateString()}</>
            )}
          </CardDescription>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <Clock size={12} className="inline mr-1" />
          {new Date(c.created_at).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{c.description}</p>

        {c.status === 'rejected' && c.rejected_reason && (
          <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive border border-destructive/20">
            <strong>Rejection Reason:</strong> {c.rejected_reason}
          </div>
        )}

        {(c.status === 'completed' || c.status === 'resolved') && c.diagnostics && (
          <div className="bg-accent/5 p-3 rounded-lg text-sm space-y-1 border border-accent/10">
            <p><strong>Diagnostics:</strong> {c.diagnostics}</p>
            {c.job_notes && <p><strong>Notes:</strong> {c.job_notes}</p>}
            <p><strong>Cost:</strong> KES {c.cost}</p>
          </div>
        )}

        {c.attachment_urls && c.attachment_urls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {c.attachment_urls.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded border overflow-hidden bg-secondary hover:opacity-80 transition-opacity">
                {url.includes('.mp4') ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/10">
                    <ImageIcon size={20} className="text-muted-foreground" />
                  </div>
                ) : (
                  <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                )}
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {c.status === 'pending' && isStaff && (
            <>
              <Button onClick={() => handleAccept(c.id)} variant="accent" className="flex-1 min-w-[150px]">
                Accept
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[150px]">Reject</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Reject Consultation</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <Label>Reason for Rejection</Label>
                    <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this request is being rejected..." />
                  </div>
                  <DialogFooter>
                    <Button variant="destructive" onClick={() => handleReject(c.id)} disabled={!rejectReason}>Confirm Rejection</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {(c.status === 'accepted' || c.status === 'in_progress') && isStaff && (c.technician_id === user?.id || isAdmin) && (
            <>
              <Button variant="outline" className="flex-1 min-w-[130px]" onClick={() => nav(`/admin/messages?customer=${c.customer_id}`)}>
                Chat
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="accent" className="flex-1 min-w-[130px]">Complete</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Repair Log & Completion</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Diagnostics</Label>
                      <Textarea value={logForm.diagnostics} onChange={e => setLogForm({...logForm, diagnostics: e.target.value})} placeholder="What was the issue?" />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Notes</Label>
                      <Textarea value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})} placeholder="Additional notes..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Cost (KES)</Label>
                      <Input type="number" value={logForm.cost} onChange={e => setLogForm({...logForm, cost: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="accent" onClick={() => { setSelectedConsultation(c); handleCompleteJob(); }}>Finish Job</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {isAdmin && technicians.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <Select onValueChange={(val) => handleReassign(c.id, val)}>
                    <SelectTrigger><SelectValue placeholder="Reassign Technician" /></SelectTrigger>
                    <SelectContent>
                      {technicians.filter(t => t.user_id !== c.technician_id).map(t => (
                        <SelectItem key={t.user_id} value={t.user_id}>{t.display_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {(c.status === 'completed' || c.status === 'resolved') && (
            <div className="flex-1 flex flex-wrap items-center justify-between gap-3 py-2">
              <span className="flex items-center text-sm text-muted-foreground gap-2">
                <CheckCircle size={16} className="text-accent" /> Completed
                {c.completed_at && ` on ${new Date(c.completed_at).toLocaleDateString()}`}
              </span>

              {c.payment_status === 'paid' ? (
                <Badge variant="secondary" className="gap-1">
                  Paid{c.mpesa_receipt ? ` · ${c.mpesa_receipt}` : ""}
                </Badge>
              ) : Number(c.cost) > 0 ? (
                isStaff ? (
                  <Badge variant="outline">Awaiting payment · {formatKES(Number(c.cost))}</Badge>
                ) : (
                  <PayDialog
                    consultationId={c.id}
                    amount={Number(c.cost)}
                    defaultPhone={c.phone || ""}
                    onPaid={fetchConsultations}
                  />
                )
              ) : null}
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );

  const renderList = (items: any[]) => (
    <div className="grid gap-6">
      {items.length === 0
        ? <p className="text-center text-muted-foreground py-12">Nothing here.</p>
        : items.map(renderCard)}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-24 pt-4 pb-12 container max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {isStaff ? "Consultation Requests" : "My Consultations"}
          </h1>
          <Button variant="ghost" size="icon" onClick={fetchConsultations} disabled={refreshing}>
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="pending">Pending ({groups.pending.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({groups.active.length})</TabsTrigger>
            <TabsTrigger value="completed">Done ({groups.completed.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({groups.rejected.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{renderList(groups.pending)}</TabsContent>
          <TabsContent value="active">{renderList(groups.active)}</TabsContent>
          <TabsContent value="completed">{renderList(groups.completed)}</TabsContent>
          <TabsContent value="rejected">{renderList(groups.rejected)}</TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminConsultationsPage;
