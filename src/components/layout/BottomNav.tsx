import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, Lightbulb, MessageCircle, User, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const BottomNav = () => {
  const location = useLocation();
  const { isAdmin, isTechnician } = useAuth();
  const unread = useUnreadMessages();

  const isStaff = isAdmin || isTechnician;

  const items = [
    { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/", badge: 0 },
    { to: "/services", label: "Services", icon: Briefcase, match: (p: string) => p.startsWith("/services"), badge: 0 },
    {
      to: isStaff ? "/admin/messages" : "/messages",
      label: "Chat",
      icon: MessageCircle,
      match: (p: string) => p.startsWith("/messages") || p.startsWith("/admin/messages"),
      badge: unread,
    },
    {
      to: isStaff ? "/admin/consultations" : "/consultations",
      label: isStaff ? "Admin" : "Requests",
      icon: ClipboardList,
      match: (p: string) => p.startsWith("/consultations") || p.startsWith("/admin/consultations"),
      badge: 0
    },
    { to: "/profile", label: "Account", icon: User, match: (p: string) => (p.startsWith("/profile") || p.startsWith("/auth")) && !p.startsWith("/admin"), badge: 0 },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 max-w-screen-md mx-auto">
        {items.map(({ to, label, icon: Icon, match, badge }) => {
          const active = match(location.pathname);
          return (
            <li key={label}>
              <NavLink
                to={to}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                  {badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center leading-none"
                      aria-label={`${badge} unread`}
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate leading-none">{label === "Consultations" ? "Requests" : label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
