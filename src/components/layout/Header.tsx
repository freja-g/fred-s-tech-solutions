import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import fullmarkAsset from "@/assets/gicofix-fullmark-transparent.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky md:fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-300 ${
        isScrolled ? "bg-card/95 backdrop-blur-md shadow-sm" : "bg-card/90 backdrop-blur-sm"
      }`}
    >
      <div className="container flex items-center justify-between gap-2 h-16 md:h-20">
        <Link to="/" className="flex min-w-0 items-center group" aria-label="GiCOFix Solutions home">
          <img src={fullmarkAsset} alt="GiCOFix Solutions" className="h-11 w-auto max-w-[106px] object-contain transition-transform group-hover:scale-105 md:h-14 md:max-w-[140px]" />
        </Link>

        <nav className="flex shrink-0 items-center gap-3">
          {user ? (
            <Link
              to="/profile"
              className="text-sm font-semibold text-accent transition-colors hover:text-accent/80"
            >
              My account
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-semibold text-accent transition-colors hover:text-accent/80"
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
