import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, Lightbulb, MessageCircle, User } from "lucide-react";
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
    { to: "/get-smart", label: "Get Smart", icon: Lightbulb, match: (p: string) => p.startsWith("/get-smart"), badge: 0 },
    {
      to: isStaff ? "/admin/messages" : "/messages",
      label: "Chat",
      icon: MessageCircle,
      match: (p: string) => p.startsWith("/messages") || p.startsWith("/admin/messages"),
      badge: unread,
    },
    { to: "/profile", label: "Profile", icon: User, match: (p: string) => p.startsWith("/profile") || p.startsWith("/auth"), badge: 0 },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
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
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
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
                <span className="leading-none">{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
