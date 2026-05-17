import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-primary text-primary-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">
              Wiga Tech Solutions
            </Link>
            <nav className="flex items-center gap-6 text-sm text-primary-foreground/70">
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

          <p className="text-sm text-primary-foreground/60">
            © {currentYear} Wiga Tech Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
