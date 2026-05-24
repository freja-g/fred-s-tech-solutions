import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, LogOut, Mail, User as UserIcon, Calendar, Shield, Inbox, MessageCircle, Star } from "lucide-react";

type Profile = { display_name: string | null; email: string | null; created_at: string };
type MsgRow = { id: string; body: string; created_at: string; sender_role: string };

const ProfilePage = () => {
  const { user, loading, isAdmin, isTechnician, signOut } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resolved, setResolved] = useState<MsgRow[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);

  const isStaff = isAdmin || isTechnician;

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, email, created_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as Profile | null));

    if (!isStaff) {
      supabase
        .from("messages")
        .select("id, body, created_at, sender_role")
        .eq("customer_id", user.id)
        .neq("sender_role", "customer")
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => setResolved((data as MsgRow[]) ?? []));

      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .then(({ count }) => setTotalMessages(count ?? 0));
    }
  }, [user, isStaff]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-24 pt-6 pb-12">
        <div className="container max-w-3xl space-y-6">
          {/* Account card */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center text-2xl font-semibold">
                {(profile?.display_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold truncate">
                  {profile?.display_name || "Your Account"}
                </h1>
                <p className="text-sm text-muted-foreground truncate">{profile?.email || user.email}</p>
              </div>
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <UserIcon size={16} className="text-accent mt-0.5" />
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Display name</dt>
                  <dd className="font-medium">{profile?.display_name || "—"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-accent mt-0.5" />
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Email</dt>
                  <dd className="font-medium break-all">{profile?.email || user.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-accent mt-0.5" />
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Member since</dt>
                  <dd className="font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-accent mt-0.5" />
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Role</dt>
                  <dd className="font-medium">
                    {isAdmin ? "Admin" : isTechnician ? "Technician" : "Customer"}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
              {isStaff ? (
                <Button variant="accent" onClick={() => nav("/admin/messages")} className="flex-1">
                  <Inbox size={16} className="mr-2" /> Admin Inbox
                </Button>
              ) : (
                <Button variant="accent" onClick={() => nav("/messages")} className="flex-1">
                  Open Chat
                </Button>
              )}
              <Button variant="outline" onClick={signOut} className="flex-1">
                <LogOut size={16} className="mr-2" /> Sign out
              </Button>
            </div>
          </section>

          {!isStaff && (
            <>
              {/* Stats */}
              <section className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-3xl font-semibold text-accent">{totalMessages}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Total Messages</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-3xl font-semibold text-accent">{resolved.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Support Replies</p>
                </div>
              </section>

              {/* Resolved / Support history */}
              <section className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-accent" /> Resolved Issues
                </h2>
                {resolved.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No support responses yet. Send us a message and we'll get back to you.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {resolved.map((m) => (
                      <li key={m.id} className="flex gap-3 p-3 bg-secondary/40 rounded-lg">
                        <CheckCircle2 size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-2">{m.body}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Resolved · {new Date(m.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {isStaff && (
            <section className="bg-card border border-border rounded-xl p-6 shadow-card">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield size={18} className="text-accent" /> Staff Portal
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                You are logged in as {isAdmin ? "an Administrator" : "a Technician"}. You have access to moderate reviews and respond to customer queries.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => nav("/admin/messages")} className="justify-start">
                  <MessageCircle size={16} className="mr-2" /> Manage Messages
                </Button>
                <Button variant="outline" onClick={() => nav("/admin/reviews")} className="justify-start">
                  <Star size={16} className="mr-2" /> Moderate Reviews
                </Button>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
