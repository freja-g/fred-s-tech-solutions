import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(5).max(2000),
  authorRole: z.string().trim().max(120).optional(),
});

const ReviewsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) ?? []));
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("reviews-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ rating, title, body, authorRole });
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data: profile } = await supabase
      .from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      author_name: (profile as any)?.display_name ?? user.email?.split("@")[0] ?? "Customer",
      author_role: authorRole || null,
      rating,
      title: title || null,
      body,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted", description: "Thanks! It will appear once approved." });
      setTitle(""); setBody(""); setAuthorRole(""); setRating(5);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 py-6">
        <section className="container max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-accent font-medium text-sm uppercase tracking-wide mb-3">Reviews</p>
            <h1 className="text-3xl md:text-4xl font-semibold mb-3">Customer Reviews & Testimonials</h1>
            <p className="text-muted-foreground">Real feedback from clients we've helped.</p>
          </div>

          {/* Approved reviews info card */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-8 text-center text-xs sm:text-sm text-muted-foreground shadow-sm">
            <p>
              Reviews are submitted by clients from <Link to="/consultations" className="font-bold text-accent hover:underline">Consultations</Link> after a completed job is paid. Approved reviews appear here and on Home.
            </p>
          </div>

          {/* Approved reviews */}
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.length === 0 && (
              <p className="md:col-span-2 text-center text-muted-foreground py-8">No reviews yet — be the first!</p>
            )}
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                {r.title && <h3 className="font-semibold mb-2">{r.title}</h3>}
                <blockquote className="text-foreground/90 text-sm leading-relaxed mb-4">"{r.body}"</blockquote>
                <div className="border-t border-border pt-3">
                  <p className="font-medium text-sm">{r.author_name}</p>
                  {r.author_role && <p className="text-xs text-muted-foreground">{r.author_role}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReviewsPage;
