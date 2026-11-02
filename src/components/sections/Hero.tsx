import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Hero = () => {
  return (
    <section className="bg-primary">
      <div className="container py-10 sm:py-14 md:py-20">
        <div className="max-w-2xl">
          <motion.h1
            className="mb-4 text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Technical Consulting That{" "}
            <span className="text-accent">Actually Works</span>
          </motion.h1>

          <motion.p
            className="mb-6 max-w-xl text-base text-primary-foreground/80 md:text-lg"
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
              className={cn(
                buttonVariants({ size: "xl" }),
                "bg-accent text-accent-foreground font-bold hover:bg-accent/90 text-base sm:text-lg px-8 py-4 rounded-xl"
              )}
            >
              View Services
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
