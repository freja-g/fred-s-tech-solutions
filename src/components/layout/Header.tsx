import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase as _sb } from "@/integrations/supabase/client";
import fullmarkAsset from "@/assets/gicofix-fullmark-transparent.png";

const supabase: any = _sb;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setDisplayName(null);
      return;
    }
    supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setDisplayName(data.display_name);
        }
      });
  }, [user]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border/50 transition-all duration-300 pt-[env(safe-area-inset-top,6px)] ${
        isScrolled ? "bg-card/75 backdrop-blur-xl shadow-md shadow-black/5" : "bg-card/65 backdrop-blur-lg"
      }`}
    >
      <div className="container flex items-center justify-between gap-2 h-16 md:h-20 px-4">
        <Link to="/" className="flex min-w-0 items-center group" aria-label="GiCOFix Solutions home">
          <img src={fullmarkAsset} alt="GiCOFix Solutions" className="h-11 w-auto max-w-[106px] object-contain transition-transform group-hover:scale-105 md:h-14 md:max-w-[140px]" />
        </Link>

        <nav className="flex shrink-0 items-center gap-3">
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 group p-1 rounded-full hover:bg-secondary/60 transition-colors"
              aria-label="Profile account"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center border-2 border-accent/40 overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (displayName || user.email || "U").charAt(0).toUpperCase()
                )}
              </div>
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
