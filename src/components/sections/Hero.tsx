import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const valueBullets = [
  "Cut through technical complexity with clear, actionable advice",
  "Hardware, software, and data expertise in one place",
  "Solutions that work in the real world, not just in theory",
  "Practical help for businesses that need results",
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-primary overflow-hidden">
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: "radial-gradient(ellipse at 70% 20%, hsl(174 60% 40% / 0.15) 0%, transparent 50%)",
        }}
      />
      
      <div className="container relative z-10 py-32 md:py-40">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-tight mb-6 animate-fade-up">
            Technical Consulting That{" "}
            <span className="text-accent">Actually Works</span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Practical guidance on hardware, software, and data. 
            No jargon. No fluff. Just clear solutions that solve real problems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" asChild>
              <a href="#contact">
                Book a Consultation
                <ArrowRight className="ml-2" size={18} />
              </a>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="#services">View Services</a>
            </Button>
          </div>

          <div className="space-y-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {valueBullets.map((bullet, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="text-accent mt-0.5 flex-shrink-0" size={20} />
                <span className="text-primary-foreground/80 text-sm md:text-base">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
