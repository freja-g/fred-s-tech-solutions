import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import fullmarkAsset from "@/assets/gicofix-fullmark-transparent.png";

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
      className={`sticky md:fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="container flex items-center justify-between gap-2 h-16 md:h-20">
        <Link to="/" className="flex min-w-0 items-center group" aria-label="GiCOFix Solutions home">
          <img src={fullmarkAsset} alt="GiCOFix Solutions" className="h-12 w-auto max-w-[118px] object-contain transition-transform group-hover:scale-105 md:h-16 md:max-w-none" />
        </Link>

        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          {user ? (
            <button
              onClick={signOut}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:h-auto md:w-auto md:text-sm md:font-medium md:gap-1"
              aria-label="Sign out"
            >
              <LogOut size={18} /> <span className="hidden md:inline">Sign out</span>
            </button>
          ) : (
            <Link to="/auth" className="px-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:text-sm">
              Sign in
            </Link>
          )}
          <Link to="/book" className={cn(buttonVariants({ variant: "accent", size: "sm" }), "px-3 sm:px-4")}>
            <span className="md:hidden">Book</span><span className="hidden md:inline">Book Consultation</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
