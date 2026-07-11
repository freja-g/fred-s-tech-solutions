import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Determine if we are in Tech App mode via environment variable
const APP_TYPE = import.meta.env.VITE_APP_TYPE || "user"; // "user" or "tech"

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
  displayName: z.string().trim().min(1).max(80).optional(),
  role: z.enum(["customer", "technician"]),
});

const AuthPage = () => {
  const { user, isAdmin, isTechnician, loading } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Default role depends on the App Type
  const [role, setRole] = useState<"customer" | "technician">(
    APP_TYPE === "tech" ? "technician" : "customer"
  );

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin || isTechnician) {
        nav("/admin/messages", { replace: true });
      } else {
        nav("/messages", { replace: true });
      }
    }
  }, [user, isAdmin, isTechnician, loading, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // WIGA STAFF: staff accounts are provisioned by admins, self-signup is disabled.
    if (APP_TYPE === "tech" && mode === "signup") {
      toast({
        title: "Sign-up disabled",
        description: "Staff accounts are created by an administrator. Please sign in.",
        variant: "destructive",
      });
      setMode("signin");
      return;
    }

    // WIGA TECH always creates customer accounts; role selector removed from schema check.
    const finalRole: "customer" | "technician" = "customer";

    const parsed = schema.safeParse({
      email,
      password,
      displayName: mode === "signup" ? displayName : undefined,
      role: finalRole,
    });

    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
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
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Enforce which app each role can sign into.
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
              description: "This account is not a staff account. Please use the WIGA TECH app.",
              variant: "destructive",
            });
            return;
          }
          if (APP_TYPE !== "tech" && isStaff) {
            await supabase.auth.signOut();
            toast({
              title: "Staff accounts only sign in on WIGA STAFF",
              description: "Please open the WIGA STAFF app to access the admin portal.",
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
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-24 pt-4 pb-12 container max-w-md">
        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-2xl font-semibold mb-2">
            {APP_TYPE === "tech" ? "Staff Login" : mode === "signin" ? "Sign in" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {APP_TYPE === "tech"
              ? "Access the technician portal to manage conversations."
              : mode === "signin"
                ? "Sign in to access your dashboard."
                : "Sign up to get started with our services."}
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && APP_TYPE !== "tech" && (
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} maxLength={100} required />
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={busy}>
              {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>
          {APP_TYPE !== "tech" && (
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-4 text-sm text-accent hover:underline w-full text-center"
            >
              {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            <Link to="/" className="hover:text-accent">Back to home</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
