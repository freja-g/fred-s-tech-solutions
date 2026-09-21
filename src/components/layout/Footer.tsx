import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-primary text-primary-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="GiCOFix" className="w-6 h-6" />
              <span className="text-lg font-bold">GiCOFix Solutions</span>
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-primary-foreground/70">
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

          <p className="text-center text-sm text-primary-foreground/60 md:text-right">
            © {currentYear} GiCOFix Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
