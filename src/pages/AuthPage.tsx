import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ZONES, SPECIALTIES } from "@/lib/staff";

// Determine if we are in Tech App mode via environment variable
const APP_TYPE = import.meta.env.VITE_APP_TYPE || "user"; // "user" or "tech"

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
  displayName: z.string().trim().min(1).max(80).optional(),
});

const AuthPage = () => {
  const { user, isAdmin, isTechnician, loading } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const redirect = searchParams.get("redirect");
      if (redirect) {
        nav(redirect, { replace: true });
        return;
      }

      if (isAdmin || isTechnician) {
        nav("/", { replace: true });
      } else {
        nav("/messages", { replace: true });
      }
    }
  }, [user, isAdmin, isTechnician, loading, nav, searchParams]);

  const toggleZone = (zone: string) => {
    setSelectedZones(prev =>
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // GiCOFix Staff App Technician Registration
    if (APP_TYPE === "tech" && mode === "signup") {
      if (!displayName.trim()) {
        toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
        return;
      }
      if (!phone.trim()) {
        toast({ title: "Phone required", description: "Please enter your phone number.", variant: "destructive" });
        return;
      }
      if (selectedZones.length === 0) {
        toast({ title: "Location required", description: "Please select at least one location/coverage area.", variant: "destructive" });
        return;
      }
      if (selectedSpecialties.length === 0) {
        toast({ title: "Speciality required", description: "Please select at least one area of speciality.", variant: "destructive" });
        return;
      }
    }

    const parsed = schema.safeParse({
      email,
      password,
      displayName: mode === "signup" ? displayName : undefined,
    });

    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        if (APP_TYPE === "tech") {
          // 1. Sign up technician
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                display_name: displayName.trim(),
                role: "technician",
                phone: phone.trim(),
              },
            },
          });

          if (authError) throw authError;

          const uid = authData.user?.id;
          if (uid) {
            // 2. Insert technician role
            await supabase.from("user_roles").upsert(
              { user_id: uid, role: "technician" },
              { onConflict: "user_id,role" }
            );

            // 3. Upsert into public.profiles
            await supabase.from("profiles").upsert(
              {
                user_id: uid,
                display_name: displayName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                coverage_zones: selectedZones,
                is_online: true,
              },
              { onConflict: "user_id" }
            );

            // 4. Upsert into public.technician_profiles
            await supabase.from("technician_profiles").upsert(
              {
                user_id: uid,
                phone: phone.trim(),
                headline: `${selectedSpecialties.slice(0, 2).join(" & ")} Specialist`,
                specialties: selectedSpecialties,
                zones: selectedZones,
                is_online: true,
                accepting_jobs: true,
              },
              { onConflict: "user_id" }
            );
          }

          toast({ title: "Welcome!", description: "Technician account registered successfully." });

          // Auto sign in if session was not attached immediately
          if (!authData.session) {
            await supabase.auth.signInWithPassword({ email: email.trim(), password });
          }
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/messages`,
              data: {
                display_name: displayName,
                role: "customer",
              },
            },
          });
          if (error) throw error;
          toast({ title: "Welcome!", description: "Your account is ready." });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const uid = data.user?.id;
        if (uid) {
          const { data: roleRows } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", uid);
          const roles = (roleRows ?? []).map((r: any) => r.role as string);
          const isStaff = roles.includes("admin") || roles.includes("technician");

          if (APP_TYPE === "tech" && !isStaff) {
            await supabase.auth.signOut();
            toast({
              title: "Access denied",
              description: "This account is not a staff account. Please register as a technician.",
              variant: "destructive",
            });
            return;
          }
          if (APP_TYPE !== "tech" && isStaff) {
            await supabase.auth.signOut();
            toast({
              title: "Staff accounts only sign in on GiCOFix Staff",
              description: "Please open the GiCOFix Staff app to access the admin portal.",
              variant: "destructive",
            });
            return;
          }
        }
      }
    } catch (err: any) {
      toast({ title: "Authentication error", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-20 sm:pt-24 px-4 container max-w-lg py-6">
        <div className="bg-card border border-border rounded-xl p-5 sm:p-8 w-full shadow-sm">
          <h1 className="text-2xl font-bold mb-1 text-foreground">
            {APP_TYPE === "tech"
              ? mode === "signin"
                ? "GiCOFix Staff Login"
                : "Technician Sign Up"
              : mode === "signin"
                ? "Sign in"
                : "Create your account"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            {APP_TYPE === "tech"
              ? mode === "signin"
                ? "Sign in to access technician portal and manage requests."
                : "Register as a technician to start accepting service jobs."
              : mode === "signin"
                ? "Sign in to access your dashboard."
                : "Sign up to get started with our services."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. John Maina"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            {mode === "signup" && APP_TYPE === "tech" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Location / Coverage Areas
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Select all areas where you can provide doorstep service:</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ZONES.map((zone) => {
                      const selected = selectedZones.includes(zone);
                      return (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => toggleZone(zone)}
                          className="focus:outline-none"
                        >
                          <Badge
                            variant={selected ? "default" : "outline"}
                            className="cursor-pointer text-[11px] py-1 px-2.5"
                          >
                            {zone}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Areas of Speciality
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Select services you are qualified to handle:</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SPECIALTIES.map((spec) => {
                      const selected = selectedSpecialties.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpecialty(spec)}
                          className="focus:outline-none"
                        >
                          <Badge
                            variant={selected ? "default" : "outline"}
                            className="cursor-pointer text-[11px] py-1 px-2.5"
                          >
                            {spec}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                maxLength={100}
                required
              />
            </div>

            <Button type="submit" variant="accent" className="w-full font-bold" disabled={busy}>
              {busy
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign in"
                  : APP_TYPE === "tech"
                    ? "Register as Technician"
                    : "Sign up"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 text-xs font-bold text-accent hover:underline w-full text-center"
          >
            {mode === "signin"
              ? APP_TYPE === "tech"
                ? "Need a technician account? Register here"
                : "Don't have an account? Sign up"
              : "Already registered? Sign in"}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            <Link to="/legal" className="hover:text-accent">Terms & Privacy</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
