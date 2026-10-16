import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, MessageCircle, User, ClipboardList, Settings, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { supabase as _sb } from "@/integrations/supabase/client";

const supabase: any = _sb;
const APP_TYPE = import.meta.env.VITE_APP_TYPE || "user";

const BottomNav = () => {
  const location = useLocation();
  const { user, isAdmin, isTechnician } = useAuth();
  const unread = useUnreadMessages();
  const [hasPaymentDue, setHasPaymentDue] = useState(false);

  const isStaff = isAdmin || isTechnician;

  useEffect(() => {
    if (!user || isStaff) return;
    supabase
      .from("consultations")
      .select("id")
      .eq("customer_id", user.id)
      .in("status", ["completed", "resolved", "payment_due"])
      .limit(1)
      .then(({ data }: any) => {
        if (data && data.length > 0) setHasPaymentDue(true);
        else setHasPaymentDue(false);
      });
  }, [user, isStaff, location.pathname]);

  if (APP_TYPE === "tech" && (!user || !isStaff)) {
    return null;
  }

  const items = isStaff
    ? [
        { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/", badge: 0, amberDot: false },
        {
          to: "/admin/consultations",
          label: "Consultations",
          icon: ClipboardList,
          match: (p: string) => p.startsWith("/admin/consultations") || p === "/consultations",
          badge: 0,
          amberDot: false,
        },
        {
          to: "/admin/messages",
          label: "Chat",
          icon: MessageCircle,
          match: (p: string) => p.startsWith("/admin/messages") || p === "/messages",
          badge: unread,
          amberDot: false,
        },
        {
          to: "/admin/content",
          label: "Content Management",
          icon: Settings,
          match: (p: string) => p.startsWith("/admin/content"),
          badge: 0,
          amberDot: false,
        },
        {
          to: "/profile",
          label: "Profile",
          icon: User,
          match: (p: string) => (p.startsWith("/profile") || p.startsWith("/auth")) && !p.startsWith("/admin"),
          badge: 0,
          amberDot: false,
        },
      ]
    : [
        { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/", badge: 0, amberDot: false },
        { to: "/services", label: "Services", icon: Briefcase, match: (p: string) => p.startsWith("/services"), badge: 0, amberDot: false },
        {
          to: "/consultations",
          label: "Consultations",
          icon: ClipboardList,
          match: (p: string) => p.startsWith("/consultations"),
          badge: 0,
          amberDot: hasPaymentDue,
        },
        {
          to: "/get-smart",
          label: "Get Smart",
          icon: Lightbulb,
          match: (p: string) => p.startsWith("/get-smart"),
          badge: 0,
          amberDot: false,
        },
        {
          to: "/profile",
          label: "Account",
          icon: User,
          match: (p: string) => (p.startsWith("/profile") || p.startsWith("/auth")) && !p.startsWith("/admin"),
          badge: unread,
          amberDot: false,
        },
      ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white dark:bg-card pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 max-w-screen-md mx-auto">
        {items.map(({ to, label, icon: Icon, match, badge, amberDot }) => {
          const active = match(location.pathname);
          return (
            <li key={label}>
              <NavLink
                to={to}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[10px] font-bold transition-colors sm:text-[11px]",
                  active ? "text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("relative flex h-8 min-w-12 items-center justify-center rounded-full transition-colors", active && "bg-accent/15 text-accent")}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  {badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center leading-none"
                      aria-label={`${badge} unread`}
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                  {amberDot && (
                    <span
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-sm"
                      aria-label="Payment due"
                    />
                  )}
                </span>
                <span className="max-w-full truncate leading-none">{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
