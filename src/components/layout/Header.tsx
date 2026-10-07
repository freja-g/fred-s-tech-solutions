import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

        <nav className="flex shrink-0 items-center gap-3">
          {user ? (
            <Link
              to="/profile"
              className="text-xs font-semibold text-foreground hover:text-accent sm:text-sm transition-colors"
            >
              My account
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-xs font-semibold text-foreground hover:text-accent sm:text-sm transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
