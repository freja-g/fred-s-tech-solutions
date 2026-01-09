import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import FloatingShapes from "@/components/graphics/FloatingShapes";

const valueBullets = [
  "Cut through technical complexity with clear, actionable advice",
  "Hardware, software, and data expertise in one place",
  "Solutions that work in the real world, not just in theory",
  "Practical help for businesses that need results",
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-primary/60 z-[1]" />
      
      {/* Floating animated shapes */}
      <div className="absolute inset-0 z-[2]">
        <FloatingShapes />
      </div>
      
      <div className="container relative z-10 py-32 md:py-40">
        <div className="max-w-3xl">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Technical Consulting That{" "}
            <span className="text-accent">Actually Works</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Practical guidance on hardware, software, and data. 
            No jargon. No fluff. Just clear solutions that solve real problems.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/contact">
                Book a Consultation
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/services">View Services</Link>
            </Button>
          </motion.div>

          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {valueBullets.map((bullet, index) => (
              <motion.div 
                key={index} 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <CheckCircle2 className="text-accent mt-0.5 flex-shrink-0" size={20} />
                <span className="text-primary-foreground/80 text-sm md:text-base">{bullet}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[3]" />
    </section>
  );
};

export default Hero;
