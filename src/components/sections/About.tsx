const About = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
            About
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8">
            Technical expertise grounded in practical results
          </h2>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              I'm Fred, a Technical Consultant and IT Specialist with a background spanning 
              hardware diagnostics, software development, and data analysis. My approach is 
              simple: understand the problem, find the clearest solution, and make it work.
            </p>
            
            <p>
              I've worked with small businesses struggling with outdated systems, startups 
              needing technical direction, and individuals overwhelmed by tech decisions. 
              In every case, the goal is the same—deliver outcomes that matter, not 
              recommendations that gather dust.
            </p>
            
            <p>
              What sets me apart is a commitment to clarity. I explain things in plain 
              language, focus on what's actionable, and stay engaged until the problem 
              is actually solved. No buzzwords. No upselling. Just technical help that 
              makes a difference.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-secondary rounded-lg">
              <p className="text-3xl font-semibold text-foreground mb-1">10+</p>
              <p className="text-sm text-muted-foreground">Years of Experience</p>
            </div>
            <div className="text-center p-6 bg-secondary rounded-lg">
              <p className="text-3xl font-semibold text-foreground mb-1">50+</p>
              <p className="text-sm text-muted-foreground">Clients Helped</p>
            </div>
            <div className="text-center p-6 bg-secondary rounded-lg">
              <p className="text-3xl font-semibold text-foreground mb-1">100%</p>
              <p className="text-sm text-muted-foreground">Practical Focus</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
