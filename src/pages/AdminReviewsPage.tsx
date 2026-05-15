import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Review = {
  id: string;
  author_name: string;
  author_role: string | null;
  rating: number;
  title: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const AdminReviewsPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (!loading && !user) nav("/auth");
    if (!loading && user && !isAdmin) nav("/");
  }, [user, loading, isAdmin, nav]);

  const load = () => {
    supabase.from("reviews").select("*").eq("status", filter).order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) ?? []));
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, filter]);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) toast({ title: "Failed", variant: "destructive" });
    else { toast({ title: `Review ${status}` }); load(); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16 container max-w-4xl">
        <h1 className="text-2xl font-semibold mb-6">Review Moderation</h1>
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "accent" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <div className="space-y-4">
          {reviews.length === 0 && <p className="text-muted-foreground text-center py-8">No {filter} reviews.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex gap-1 mb-2">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              {r.title && <h3 className="font-semibold mb-1">{r.title}</h3>}
              <p className="text-sm text-foreground/90 mb-3">{r.body}</p>
              <p className="text-xs text-muted-foreground mb-3">
                — {r.author_name}{r.author_role ? `, ${r.author_role}` : ""} · {new Date(r.created_at).toLocaleDateString()}
              </p>
              {filter === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="accent" onClick={() => setStatus(r.id, "approved")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")}>Reject</Button>
                </div>
              )}
              {filter === "approved" && (
                <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")}>Unpublish</Button>
              )}
              {filter === "rejected" && (
                <Button size="sm" variant="accent" onClick={() => setStatus(r.id, "approved")}>Approve</Button>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminReviewsPage;
