import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, Lightbulb, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { to: "/services", label: "Services", icon: Briefcase, match: (p: string) => p.startsWith("/services") },
  { to: "/get-smart", label: "Get Smart", icon: Lightbulb, match: (p: string) => p.startsWith("/get-smart") },
  { to: "/messages", label: "Chat", icon: MessageCircle, match: (p: string) => p.startsWith("/messages") || p.startsWith("/admin/messages") },
  { to: "/profile", label: "Profile", icon: User, match: (p: string) => p.startsWith("/profile") || p.startsWith("/auth") },
];

const BottomNav = () => {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 max-w-screen-md mx-auto">
        {items.map(({ to, label, icon: Icon, match }) => {
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
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
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
