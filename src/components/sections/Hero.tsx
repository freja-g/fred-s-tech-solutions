import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] md:min-h-screen flex items-center overflow-hidden">
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
      
      <div className="container relative z-10 py-16 sm:py-24 md:py-40">
        <div className="max-w-2xl">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-semibold text-primary-foreground leading-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Technical Consulting That{" "}
            <span className="text-accent">Actually Works</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-primary-foreground/80 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Practical help with hardware, software, and data. No jargon, just clear solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/services"
              className={cn(buttonVariants({ variant: "hero", size: "xl" }))}
            >
              View Services
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[3]" />
    </section>
  );
};

export default Hero;
