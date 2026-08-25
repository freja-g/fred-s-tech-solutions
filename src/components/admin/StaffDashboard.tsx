import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle, Star, Settings, FileText, User, BarChart2 } from "lucide-react";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ messages: 0, reviews: 0, consultations: 0, users: 0 });

  const loadStats = async () => {
    const [msgs, revs, cons, profs] = await Promise.all([
      supabase.from("messages").select("id", { count: "exact", head: true }).is("read_at", null).eq("sender_role", "customer"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("consultations").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      messages: msgs.count || 0,
      reviews: revs.count || 0,
      consultations: cons.count || 0,
      users: profs.count || 0,
    });
  };

  useEffect(() => {
    loadStats();
    const channel = supabase
      .channel("staff-dashboard-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, loadStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, loadStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations" }, loadStats)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const links = [
    { label: "Manage Messages", path: "/admin/messages", icon: MessageCircle },
    { label: "Moderate Reviews", path: "/admin/reviews", icon: Star },
    { label: "Manage Content", path: "/admin/content", icon: Settings },
    { label: "Consultations", path: "/admin/consultations", icon: FileText },
    { label: "View Analytics", path: "/admin/analytics", icon: BarChart2 },
    { label: "Edit My Profile", path: "/profile", icon: User },
  ];

  const statCards = [
    { label: "Unread Messages", value: stats.messages },
    { label: "Pending Reviews", value: stats.reviews },
    { label: "Pending Consultations", value: stats.consultations },
    { label: "Total Users", value: stats.users },
  ];

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Shield className="text-accent h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome to the Wiga Staff Portal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map((link) => (
          <Button
            key={link.path}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all group"
            onClick={() => navigate(link.path)}
          >
            <link.icon className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
            <span>{link.label}</span>
          </Button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="p-4 bg-accent/5 rounded-lg border border-accent/10">
              <p className="text-2xl font-bold text-accent">{s.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
