import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, FolderKanban, Star, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const messagesHref = isAdmin ? "/admin/messages" : user ? "/messages" : "/auth";

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/services", label: "Services", icon: Briefcase },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/reviews", label: "Reviews", icon: Star },
    { to: messagesHref, label: "Chat", icon: MessageCircle },
    { to: user ? "/contact" : "/auth", label: user ? "Account" : "Sign in", icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-6 max-w-screen-md mx-auto">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/"
              ? location.pathname === "/"
              : location.pathname === to ||
                (to.startsWith("/messages") && location.pathname.startsWith("/messages")) ||
                (to.startsWith("/admin/messages") && location.pathname.startsWith("/admin/messages"));
          return (
            <li key={label}>
              <NavLink
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
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
