import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import wordmarkAsset from "@/assets/gicofix-wordmark.png.asset.json";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center group">
          <img src={wordmarkAsset.url} alt="GiCOFix Solutions" className="h-9 w-auto rounded-md transition-transform group-hover:scale-105" />
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <button
              onClick={signOut}
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
              aria-label="Sign out"
            >
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          )}
          <Link to="/services" className={cn(buttonVariants({ variant: "accent", size: "sm" }))}>
            View Services
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
