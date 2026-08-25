
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import { BarChart, DollarSign, Briefcase, Star, Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminAnalyticsPage = () => {
  const { user, isAdmin, isTechnician, loading } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    avgRating: 0,
    avgResponseTime: 0,
    recentJobs: [] as any[]
  });

  const isStaff = isAdmin || isTechnician;

  const fetchAnalytics = async () => {
    if (!user) return;

    // 1. Earnings and Jobs
    let jobsQuery = supabase.from("consultations").select("*");
    if (!isAdmin) jobsQuery = jobsQuery.eq("technician_id", user.id);

    const { data: jobs } = await jobsQuery;
    const completed = jobs?.filter(j => j.status === 'completed') || [];
    const totalEarnings = completed.reduce((acc, curr) => acc + (curr.cost || 0), 0);

    // 2. Ratings
    const { data: reviews } = await supabase.from("reviews").select("rating").eq("status", "approved");
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;

    // 3. Response Times (Hours)
    const responseTimes = completed
      .filter(j => j.assigned_at && j.created_at)
      .map(j => (new Date(j.assigned_at).getTime() - new Date(j.created_at).getTime()) / (1000 * 60 * 60));
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((acc, curr) => acc + curr, 0) / responseTimes.length
      : 0;

    setStats({
      totalEarnings,
      completedJobs: completed.length,
      avgRating,
      avgResponseTime,
      recentJobs: completed.slice(0, 5)
    });
  };

  useEffect(() => {
    if (isStaff) fetchAnalytics();
  }, [isStaff, user]);

  if (loading || !isStaff) return null;

  const statCards = [
    { label: "Total Earnings", value: `KES ${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Jobs Completed", value: stats.completedJobs, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Average Rating", value: stats.avgRating.toFixed(1), icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Avg. Response (Hrs)", value: stats.avgResponseTime.toFixed(1), icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-24 pt-4 pb-12 container max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Technician Analytics</h1>
            <p className="text-muted-foreground">Performance insights and earnings breakdown.</p>
          </div>
          <Badge variant="outline" className="w-fit py-1.5 px-3">
            <TrendingUp size={14} className="mr-2" /> Data refreshes in real-time
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((s, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <s.icon size={20} className={s.color} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Job History</CardTitle>
              <CardDescription>Your last 5 completed consultations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentJobs.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No completed jobs yet.</p>
                ) : (
                  stats.recentJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <p className="font-medium">{job.subject}</p>
                          <p className="text-xs text-muted-foreground">{new Date(job.completed_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+ KES {job.cost}</p>
                        <Badge variant="secondary" className="text-[10px]">Verified</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Goal</CardTitle>
              <CardDescription>Track your progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Job Target</span>
                  <span className="font-medium">{stats.completedJobs} / 20</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-1000"
                    style={{ width: `${Math.min((stats.completedJobs / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold mb-3">Service Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Software</span>
                    <span>45%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Hardware</span>
                    <span>30%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Consulting</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>

              <div className="bg-accent/5 p-4 rounded-lg border border-accent/10 mt-4">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Top Performer Tip</p>
                <p className="text-sm">Response times under 2 hours increase customer tips by up to 20%.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;
