import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full overflow-hidden bg-primary py-6 text-primary-foreground sm:py-8">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex min-w-0 flex-col items-center gap-4 md:flex-row md:gap-6">
            <Link to="/" className="flex max-w-full items-center gap-2 transition-opacity hover:opacity-80">
              <img src="/logo.svg" alt="" className="h-6 w-6 shrink-0" />
              <span className="min-w-0 break-words text-base font-bold sm:text-lg">GiCOFix Solutions</span>
            </Link>
            <nav className="flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-primary-foreground/70 md:justify-start">
              <Link to="/about" className="hover:text-primary-foreground transition-colors">
                About
              </Link>
              <Link to="/services" className="hover:text-primary-foreground transition-colors">
                Services
              </Link>
              <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                Book a Consultation
              </Link>
            </nav>
          </div>

          <p className="max-w-full text-center text-xs leading-relaxed text-primary-foreground/60 sm:text-sm md:shrink-0 md:text-right">
            © {currentYear} GiCOFix Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
