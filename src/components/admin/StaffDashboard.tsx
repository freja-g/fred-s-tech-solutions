import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, MessageSquare, Star, Plus, BarChart2, Clock, ArrowRight } from "lucide-react";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    customers: 0,
    unreadChats: 0,
    pendingReviews: 0,
  });

  const loadData = async () => {
    const [p, ip, c, cust, msgs, revs] = await Promise.all([
      supabase.from("consultations").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("consultations").select("id", { count: "exact", head: true }).in("status", ["accepted", "in_progress"]),
      supabase.from("consultations").select("id", { count: "exact", head: true }).in("status", ["completed", "resolved"]),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }).is("read_at", null).eq("sender_role", "customer"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    setCounts({
      pending: p.count || 0,
      inProgress: ip.count || 0,
      completed: c.count || 0,
      customers: cust.count || 0,
      unreadChats: msgs.count || 0,
      pendingReviews: revs.count || 0,
    });
  };

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel("staff-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, loadData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="container max-w-4xl py-2 sm:py-6 space-y-6">
      {/* Title matching Page 1 PDF */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Overview of active customer requests</p>
        </div>
      </div>

      {/* Summary Metrics Cards matching Page 1 PDF */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-accent">{counts.pending}</p>
          <p className="text-xs font-semibold text-muted-foreground">Pending</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-accent">{counts.inProgress}</p>
          <p className="text-xs font-semibold text-muted-foreground">In Progress</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-accent">{counts.completed}</p>
          <p className="text-xs font-semibold text-muted-foreground">Completed</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-accent">{counts.customers}</p>
          <p className="text-xs font-semibold text-muted-foreground">Customers</p>
        </div>
      </div>

      {/* Needs Attention Section matching Page 1 PDF */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Needs Attention</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border shadow-sm overflow-hidden text-sm">
          <div className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{counts.pending} Pending consultations</p>
              <p className="text-xs text-muted-foreground">New customer requests awaiting technician acceptance</p>
            </div>
            <Button size="sm" variant="accent" onClick={() => navigate("/admin/consultations")}>
              Review
            </Button>
          </div>

          <div className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{counts.pendingReviews} Reviews to approve</p>
              <p className="text-xs text-muted-foreground">Customer testimonials ready for moderation</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/admin/reviews")}>
              Open
            </Button>
          </div>

          <div className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{counts.unreadChats} Unread chats</p>
              <p className="text-xs text-muted-foreground">Customer messages requiring response</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/admin/messages")}>
              Reply
            </Button>
          </div>
        </div>
      </div>

      {/* Shortcuts Section matching Page 1 PDF */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/admin/analytics")}
            className="p-4 bg-card border border-border rounded-xl hover:border-accent transition-all flex flex-col items-start gap-2 text-left group shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Analytics</p>
              <p className="text-xs text-muted-foreground">Revenue, performance, charts</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/availability")}
            className="p-4 bg-card border border-border rounded-xl hover:border-accent transition-all flex flex-col items-start gap-2 text-left group shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Availability</p>
              <p className="text-xs text-muted-foreground">Working hours and shifts</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/content")}
            className="p-4 bg-card border border-border rounded-xl hover:border-accent transition-all flex flex-col items-start gap-2 text-left group shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <Plus size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Add a Service</p>
              <p className="text-xs text-muted-foreground">Publish services & Get Smart tips</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
