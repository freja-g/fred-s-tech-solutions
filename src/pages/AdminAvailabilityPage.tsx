import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase as _sb } from "@/integrations/supabase/client";
import { ZONES, SPECIALTIES, DAYS } from "@/lib/staff";
import { Plus, Trash2, Loader2 } from "lucide-react";

const supabase: any = _sb;

const AdminAvailabilityPage = () => {
  const { user, loading, isAdmin, isTechnician } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const isStaff = isAdmin || isTechnician;

  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    headline: "",
    bio: "",
    phone: "",
    hourly_rate: "",
    specialties: [] as string[],
    zones: [] as string[],
    is_online: false,
    accepting_jobs: true,
  });
  const [shifts, setShifts] = useState<any[]>([]);
  const [newShift, setNewShift] = useState({ day_of_week: "1", start_time: "08:00", end_time: "17:00" });

  useEffect(() => {
    if (!loading && !user) nav("/auth");
    if (!loading && user && !isStaff) nav("/");
  }, [user, loading, isStaff, nav]);

  const load = async () => {
    if (!user) return;
    setBusy(true);
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("technician_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("technician_shifts").select("*").eq("technician_id", user.id).order("day_of_week"),
    ]);
    if (p) {
      setProfile({
        headline: p.headline ?? "",
        bio: p.bio ?? "",
        phone: p.phone ?? "",
        hourly_rate: p.hourly_rate ?? "",
        specialties: p.specialties ?? [],
        zones: p.zones ?? [],
        is_online: !!p.is_online,
        accepting_jobs: p.accepting_jobs !== false,
      });
    }
    setShifts(s ?? []);
    setBusy(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleIn = (key: "specialties" | "zones", value: string) =>
    setProfile((prev: any) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v: string) => v !== value)
        : [...prev[key], value],
    }));

  const saveProfile = async (overrides: Record<string, any> = {}) => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      headline: profile.headline || null,
      bio: profile.bio || null,
      phone: profile.phone || null,
      hourly_rate: profile.hourly_rate === "" ? null : Number(profile.hourly_rate),
      specialties: profile.specialties,
      zones: profile.zones,
      is_online: profile.is_online,
      accepting_jobs: profile.accepting_jobs,
      ...overrides,
    };
    const { error } = await supabase
      .from("technician_profiles")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
    else toast({ title: "Saved", description: "Your technician profile is up to date." });
  };

  const setToggle = async (key: "is_online" | "accepting_jobs", value: boolean) => {
    setProfile((p: any) => ({ ...p, [key]: value }));
    await saveProfile({ [key]: value });
  };

  const addShift = async () => {
    if (!user) return;
    if (newShift.start_time >= newShift.end_time) {
      toast({ title: "Invalid shift", description: "End time must be after start time.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("technician_shifts").insert({
      technician_id: user.id,
      day_of_week: Number(newShift.day_of_week),
      start_time: newShift.start_time,
      end_time: newShift.end_time,
    });
    if (error) toast({ title: "Could not add shift", description: error.message, variant: "destructive" });
    else load();
  };

  const removeShift = async (id: string) => {
    const { error } = await supabase.from("technician_shifts").delete().eq("id", id);
    if (error) toast({ title: "Could not remove", description: error.message, variant: "destructive" });
    else setShifts((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-24 pt-4 pb-12 container max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Availability & Skills</h1>
          <p className="text-sm text-muted-foreground">
            Control when you work, where you cover, and what jobs you take.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
            <CardDescription>Customers only see technicians who are online and accepting jobs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Online</p>
                <p className="text-xs text-muted-foreground">Show as available right now</p>
              </div>
              <Switch checked={profile.is_online} onCheckedChange={(v) => setToggle("is_online", v)} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Accepting new jobs</p>
                <p className="text-xs text-muted-foreground">Turn off when your queue is full</p>
              </div>
              <Switch checked={profile.accepting_jobs} onCheckedChange={(v) => setToggle("accepting_jobs", v)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Shown to customers browsing technicians.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" value={profile.headline} maxLength={80}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="Networking & CCTV specialist" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={profile.phone} maxLength={20}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+254..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Hourly rate (KES)</Label>
              <Input id="rate" type="number" min={0} value={profile.hourly_rate}
                onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                placeholder="1500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">About you</Label>
              <Textarea id="bio" rows={3} maxLength={600} value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Seven years fixing office networks and point-of-sale setups..." />
            </div>

            <div className="space-y-2">
              <Label>Specialised skills</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button key={s} type="button" onClick={() => toggleIn("specialties", s)}>
                    <Badge variant={profile.specialties.includes(s) ? "default" : "outline"} className="cursor-pointer">
                      {s}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Coverage areas</Label>
              <div className="flex flex-wrap gap-2">
                {ZONES.map((z) => (
                  <button key={z} type="button" onClick={() => toggleIn("zones", z)}>
                    <Badge variant={profile.zones.includes(z) ? "default" : "outline"} className="cursor-pointer">
                      {z}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => saveProfile()} disabled={saving || busy} variant="accent" className="w-full sm:w-auto">
              {saving && <Loader2 className="mr-2 animate-spin" size={16} />} Save profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly shifts</CardTitle>
            <CardDescription>Your regular working hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <div className="space-y-1">
                <Label className="text-xs">Day</Label>
                <Select value={newShift.day_of_week} onValueChange={(v) => setNewShift({ ...newShift, day_of_week: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="time" value={newShift.start_time}
                  onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="time" value={newShift.end_time}
                  onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })} />
              </div>
              <Button onClick={addShift} variant="outline"><Plus size={16} className="mr-1" /> Add</Button>
            </div>

            <div className="divide-y divide-border border border-border rounded-lg">
              {shifts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No shifts added yet.</p>
              )}
              {shifts.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="font-medium">{DAYS[s.day_of_week]}</span>
                  <span className="text-muted-foreground">
                    {String(s.start_time).slice(0, 5)} – {String(s.end_time).slice(0, 5)}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => removeShift(s.id)} aria-label="Remove shift">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAvailabilityPage;
