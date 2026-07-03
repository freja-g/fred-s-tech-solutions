
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, LogOut, Mail, User as UserIcon, Calendar, Shield, MessageCircle, Star, Settings, FileText, Camera as CameraIcon, Key, Save } from "lucide-react";
import { captureAndUploadImage } from "@/lib/storage";

type Profile = { display_name: string | null; email: string | null; created_at: string; avatar_url: string | null };
type MsgRow = { id: string; body: string; created_at: string; sender_role: string };

const ProfilePage = () => {
  const { user, loading, isAdmin, isTechnician, signOut } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resolved, setResolved] = useState<MsgRow[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);

  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const isStaff = isAdmin || isTechnician;

  const handleMediaUpload = async () => {
    if (!user) return;
    const url = await captureAndUploadImage("avatars", `profiles/${user.id}`);
    if (url) {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id);

      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else {
        setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
        toast({ title: "Success", description: "Profile picture updated" });
      }
    }
  };

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newName.trim() })
      .eq("user_id", user.id);

    setUpdating(false);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      setProfile(prev => prev ? { ...prev, display_name: newName.trim() } : null);
      toast({ title: "Success", description: "Username updated" });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Invalid password", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdating(false);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setNewPassword("");
      toast({ title: "Success", description: "Password has been changed" });
    }
  };

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, email, created_at, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as Profile | null);
        if (data?.display_name) setNewName(data.display_name);
      });

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
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center text-2xl font-semibold overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.display_name || user.email || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <button
                  onClick={handleMediaUpload}
                  className="absolute bottom-0 right-0 p-1 bg-accent text-accent-foreground rounded-full shadow-lg border-2 border-card hover:scale-110 transition-transform"
                >
                  <CameraIcon size={12} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold truncate">
                  {profile?.display_name || "Your Account"}
                </h1>
                <p className="text-sm text-muted-foreground truncate">{profile?.email || user.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Change Display Name</Label>
                    <div className="flex gap-2">
                      <Input id="display_name" value={newName} onChange={e => setNewName(e.target.value)} />
                      <Button size="icon" onClick={handleUpdateName} disabled={updating}><Save size={16} /></Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Change Password</Label>
                    <div className="flex gap-2">
                      <Input id="password" type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <Button size="icon" variant="outline" onClick={handleChangePassword} disabled={updating}><Key size={16} /></Button>
                    </div>
                  </div>
               </div>

               <dl className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-accent mt-0.5" />
                  <div>
                    <dt className="text-muted-foreground text-xs uppercase tracking-wide">Account Email</dt>
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
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border">
              {isStaff ? (
                <Button variant="accent" onClick={() => nav("/admin/messages")} className="flex-1">
                  Admin Inbox
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
            </>
          )}

          {isStaff && (
            <section className="bg-card border border-border rounded-xl p-6 shadow-card">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield size={18} className="text-accent" /> Staff Portal
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => nav("/admin/messages")} className="justify-start">
                  <MessageCircle size={16} className="mr-2" /> Manage Messages
                </Button>
                <Button variant="outline" onClick={() => nav("/admin/reviews")} className="justify-start">
                  <Star size={16} className="mr-2" /> Moderate Reviews
                </Button>
                <Button variant="outline" onClick={() => nav("/admin/content")} className="justify-start">
                  <Settings size={16} className="mr-2" /> Manage Content
                </Button>
                <Button variant="outline" onClick={() => nav("/admin/consultations")} className="justify-start">
                  <FileText size={16} className="mr-2" /> Consultations
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
