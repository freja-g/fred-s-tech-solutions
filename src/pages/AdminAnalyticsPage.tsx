import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase as _sb } from "@/integrations/supabase/client";
import { DollarSign, Briefcase, Star, Clock, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatKES, avg, humanDuration } from "@/lib/staff";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";

const supabase: any = _sb;

const PIE_COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--muted-foreground))", "#f59e0b", "#10b981"];

const monthKey = (d: string) => new Date(d).toLocaleString("en-KE", { month: "short", year: "2-digit" });

const AdminAnalyticsPage = () => {
  const { user, isAdmin, isTechnician, loading } = useAuth();
  const isStaff = isAdmin || isTechnician;

  const [stats, setStats] = useState({
    totalEarnings: 0,
    collected: 0,
    outstanding: 0,
    completedJobs: 0,
    avgRating: 0,
    ratingCount: 0,
    avgResponseMs: 0,
    avgJobMs: 0,
    recentJobs: [] as any[],
    monthly: [] as { month: string; earnings: number; jobs: number }[],
    services: [] as { name: string; value: number }[],
  });

  const fetchAnalytics = async () => {
    if (!user) return;

    let jobsQuery = supabase.from("consultations").select("*");
    if (!isAdmin) jobsQuery = jobsQuery.eq("technician_id", user.id);

    const [{ data: jobs }, { data: reviews }, { data: payments }, { data: services }] = await Promise.all([
      jobsQuery,
      supabase.from("reviews").select("rating, technician_id").eq("status", "approved"),
      supabase.from("payments").select("amount, status, technician_id, customer_id, consultation_id, paid_at"),
      supabase.from("services").select("id, title"),
    ]);

    const all = jobs || [];
    const completed = all.filter((j: any) => j.status === "completed" || j.status === "resolved");
    const serviceMap = new Map((services || []).map((s: any) => [s.id, s.title]));

    // Earnings — invoiced vs actually collected through M-Pesa
    const myJobIds = new Set(completed.map((j: any) => j.id));
    const relevantPayments = (payments || []).filter((p: any) => !p.consultation_id || myJobIds.has(p.consultation_id));
    const collected = relevantPayments
      .filter((p: any) => p.status === "paid")
      .reduce((a: number, p: any) => a + Number(p.amount || 0), 0);
    const totalEarnings = completed.reduce((a: number, j: any) => a + Number(j.cost || 0), 0);

    // Ratings
    const myReviews = (reviews || []).filter((r: any) => isAdmin || !r.technician_id || r.technician_id === user.id);
    const avgRating = avg(myReviews.map((r: any) => Number(r.rating)));

    // Timings
    const avgResponseMs = avg(
      completed
        .filter((j: any) => j.assigned_at && j.created_at)
        .map((j: any) => new Date(j.assigned_at).getTime() - new Date(j.created_at).getTime()),
    );
    const avgJobMs = avg(
      completed
        .filter((j: any) => j.assigned_at && j.completed_at)
        .map((j: any) => new Date(j.completed_at).getTime() - new Date(j.assigned_at).getTime()),
    );

    // Monthly trend (last 6 months present in the data)
    const byMonth = new Map<string, { month: string; earnings: number; jobs: number }>();
    completed.forEach((j: any) => {
      const k = monthKey(j.completed_at || j.created_at);
      const row = byMonth.get(k) || { month: k, earnings: 0, jobs: 0 };
      row.earnings += Number(j.cost || 0);
      row.jobs += 1;
      byMonth.set(k, row);
    });

    // Service mix
    const byService = new Map<string, number>();
    completed.forEach((j: any) => {
      const name = serviceMap.get(j.service_id) || j.subject || "Other";
      byService.set(name, (byService.get(name) || 0) + 1);
    });

    setStats({
      totalEarnings,
      collected,
      outstanding: Math.max(totalEarnings - collected, 0),
      completedJobs: completed.length,
      avgRating,
      ratingCount: myReviews.length,
      avgResponseMs,
      avgJobMs,
      recentJobs: completed
        .sort((a: any, b: any) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())
        .slice(0, 6),
      monthly: Array.from(byMonth.values()).slice(-6),
      services: Array.from(byService.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    });
  };

  useEffect(() => {
    if (!isStaff || !user) return;
    fetchAnalytics();
    const channel = supabase
      .channel("analytics-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations" }, fetchAnalytics)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, fetchAnalytics)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, fetchAnalytics)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isStaff, user, isAdmin]);

  if (loading || !isStaff) return null;

  const statCards = [
    { label: "Collected (M-Pesa)", value: formatKES(stats.collected), icon: Wallet, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Invoiced", value: formatKES(stats.totalEarnings), icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
    { label: "Jobs Completed", value: stats.completedJobs, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: `Rating (${stats.ratingCount})`, value: stats.avgRating ? stats.avgRating.toFixed(1) : "—", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-24 pt-4 pb-12 container max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Technician Analytics</h1>
            <p className="text-muted-foreground">Earnings, job history, ratings and response times.</p>
          </div>
          <Badge variant="outline" className="w-fit py-1.5 px-3">
            <TrendingUp size={14} className="mr-2" /> Live data
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statCards.map((s, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className={`p-2 rounded-lg w-fit mb-3 ${s.bg}`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Earnings by month</CardTitle>
              <CardDescription>Invoiced value of completed jobs.</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              {stats.monthly.length === 0 ? (
                <p className="text-center py-16 text-muted-foreground">No completed jobs yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={stats.monthly}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} width={60} />
                    <Tooltip formatter={(v: any) => formatKES(Number(v))} />
                    <Bar dataKey="earnings" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Turnaround</CardTitle>
              <CardDescription>How fast jobs move.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Clock size={12} /> Avg. response
                </p>
                <p className="text-xl font-semibold">{humanDuration(stats.avgResponseMs)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg. time to complete</p>
                <p className="text-xl font-semibold">{humanDuration(stats.avgJobMs)}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding balance</p>
                <p className="text-xl font-semibold text-destructive">{formatKES(stats.outstanding)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent job history</CardTitle>
              <CardDescription>Your latest completed consultations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentJobs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No completed jobs yet.</p>
              ) : (
                stats.recentJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <Briefcase size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{job.subject || "Consultation"}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">{formatKES(Number(job.cost || 0))}</p>
                      <Badge variant={job.payment_status === "paid" ? "secondary" : "outline"} className="text-[10px]">
                        {job.payment_status === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service mix</CardTitle>
              <CardDescription>Where your jobs come from.</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              {stats.services.length === 0 ? (
                <p className="text-center py-16 text-muted-foreground">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.services} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {stats.services.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;
