const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-primary text-primary-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="#" className="text-lg font-semibold">
              Wiga Tech Solutions
            </a>
            <nav className="flex items-center gap-6 text-sm text-primary-foreground/70">
              <a href="#about" className="hover:text-primary-foreground transition-colors">
                About
              </a>
              <a href="#services" className="hover:text-primary-foreground transition-colors">
                Services
              </a>
              <a href="#contact" className="hover:text-primary-foreground transition-colors">
                Contact
              </a>
            </nav>
          </div>
          
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} Fred. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
