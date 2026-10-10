import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Shield,
  MessageCircle,
  Star,
  Settings,
  FileText,
  Camera as CameraIcon,
  Save,
  MapPin,
  Activity,
  BarChart2,
  ChevronRight,
  Info,
  PhoneCall,
  FileCheck,
  Edit2,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { uploadMedia } from "@/lib/storage";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

type Profile = {
  display_name: string | null;
  email: string | null;
  created_at: string;
  avatar_url: string | null;
  is_online?: boolean;
  coverage_zones?: string[];
};

const ProfilePage = () => {
  const { user, loading, isAdmin, isTechnician, signOut } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);

  const [newName, setNewName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [zones, setZones] = useState("");

  const isStaff = isAdmin || isTechnician;

  const handleMediaUpload = async () => {
    if (!user) return;
    const url = await uploadMedia("attachments", `avatars/${user.id}`, "image");
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
      toast({ title: "Success", description: "Display name updated" });
      setEditOpen(false);
    }
  };

  const handleUpdateAvailability = async () => {
    if (!user) return;
    setUpdating(true);
    const zoneList = zones.split(",").map(s => s.trim()).filter(s => s);
    const { error } = await supabase
      .from("profiles")
      .update({ is_online: isOnline, coverage_zones: zoneList })
      .eq("user_id", user.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else toast({ title: "Success", description: "Availability updated" });
    setUpdating(false);
  };

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, email, created_at, avatar_url, is_online, coverage_zones")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as Profile | null);
        if (data?.display_name) setNewName(data.display_name);
        if (data?.is_online !== undefined) setIsOnline(data.is_online);
        if (data?.coverage_zones) setZones(data.coverage_zones.join(", "));
      });
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 container max-w-2xl space-y-6">
        {/* Profile Card matching Page 7 PDF */}
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center text-2xl font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (profile?.display_name || user.email || "U").charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={handleMediaUpload}
                className="absolute bottom-0 right-0 p-1.5 bg-accent text-accent-foreground rounded-full shadow border-2 border-card"
                title="Change picture"
              >
                <CameraIcon size={12} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">
                {profile?.display_name || user.email?.split("@")[0] || "Display name"}
              </h1>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || user.email}</p>

              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline mt-1"
              >
                <Edit2 size={12} /> Edit name and picture
              </button>
            </div>
          </div>
        </section>

        {/* Appearance Theme Switcher Card */}
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                {theme === "dark" ? (
                  <Moon size={20} />
                ) : theme === "light" ? (
                  <Sun size={20} />
                ) : (
                  <Monitor size={20} />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-sm sm:text-base text-foreground">
                  Appearance
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose Light, Dark, or System mode
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all",
                theme === "light"
                  ? "border-accent bg-accent/15 text-accent shadow-sm"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun size={15} /> Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all",
                theme === "dark"
                  ? "border-accent bg-accent/15 text-accent shadow-sm"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon size={15} /> Dark
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all",
                theme === "system"
                  ? "border-accent bg-accent/15 text-accent shadow-sm"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor size={15} /> System
            </button>
          </div>
        </section>

        {/* Links List matching Page 7 PDF */}
        <section className="bg-card border border-border rounded-xl divide-y divide-border shadow-sm overflow-hidden text-sm">
          <Link
            to="/contact"
            className="p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors"
          >
            <div>
              <h2 className="font-semibold text-foreground">Contact</h2>
              <p className="text-xs text-muted-foreground">WhatsApp, email and message form</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>

          <Link
            to="/contact#about"
            className="p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors"
          >
            <div>
              <h2 className="font-semibold text-foreground">About GiCOFix</h2>
              <p className="text-xs text-muted-foreground">Who We Are, Our Mission, Our Vision, Core Values</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>

          <Link
            to="/legal"
            className="p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors"
          >
            <div>
              <h2 className="font-semibold text-foreground">Terms & Privacy</h2>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </section>

        {/* WHO WE ARE callout matching Page 7 PDF */}
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent">WHO WE ARE</h2>
          <p className="text-sm text-foreground/90 leading-relaxed">
            Practical help with hardware, software, and data. No jargon, just clear solutions.
          </p>
        </section>

        {/* Staff Portal Links matching PDF Page 7 */}
        {isStaff && (
          <section className="bg-card border border-border rounded-xl divide-y divide-border shadow-sm overflow-hidden text-sm">
            <Link
              to="/admin/analytics"
              className="p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors"
            >
              <div>
                <h2 className="font-semibold text-foreground">Analytics</h2>
                <p className="text-xs text-muted-foreground">Revenue, performance, charts</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </Link>

            <Link
              to="/admin/availability"
              className="p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors"
            >
              <div>
                <h2 className="font-semibold text-foreground">Availability</h2>
                <p className="text-xs text-muted-foreground">Working hours and shifts</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </Link>

            <button
              onClick={() => setEditOpen(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/40 transition-colors text-left"
            >
              <div>
                <h2 className="font-semibold text-foreground">Account Settings</h2>
                <p className="text-xs text-muted-foreground">Name, picture, profile details</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </section>
        )}

        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 font-semibold"
          onClick={signOut}
        >
          <LogOut size={16} className="mr-2" /> Sign out
        </Button>

        {/* Edit Name Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Name & Picture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Display Name</Label>
                <Input
                  id="edit_name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <Button type="button" variant="outline" className="w-full" onClick={handleMediaUpload}>
                  <CameraIcon size={16} className="mr-2" /> Upload New Photo
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleUpdateName} disabled={updating}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ProfilePage;
