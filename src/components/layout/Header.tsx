import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/reviews", label: "Reviews" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const messagesHref = isAdmin ? "/admin/messages" : "/messages";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="text-xl font-semibold text-foreground">Wiga Tech Solutions</Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.href ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to={messagesHref}
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith("/messages") || location.pathname.startsWith("/admin")
                    ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAdmin ? "Inbox" : "Messages"}
              </Link>
              {isAdmin && (
                <Link to="/admin/reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Moderate
                </Link>
              )}
              <button
                onClick={signOut}
                className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                aria-label="Sign out"
              >
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          )}
          <Link to="/contact" className={cn(buttonVariants({ variant: "accent", size: "sm" }))}>
            Book a Consultation
          </Link>
        </nav>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <nav className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-base font-medium py-2 ${
                  location.pathname === link.href ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={messagesHref} className="text-base font-medium py-2 text-muted-foreground hover:text-foreground">
                  {isAdmin ? "Inbox" : "Messages"}
                </Link>
                {isAdmin && (
                  <Link to="/admin/reviews" className="text-base font-medium py-2 text-muted-foreground hover:text-foreground">
                    Moderate Reviews
                  </Link>
                )}
                <button onClick={signOut} className="text-base font-medium py-2 text-left text-muted-foreground hover:text-foreground">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" className="text-base font-medium py-2 text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
            )}
            <Link to="/contact" className={cn(buttonVariants({ variant: "accent" }), "mt-2 w-full text-center")}>
              Book a Consultation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
