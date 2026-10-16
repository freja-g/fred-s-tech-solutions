import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import logoWatermark from "@/assets/gicofix-fullmark-transparent.png";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-primary/88 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-accent/20 dark:bg-accent/30 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-primary/20 dark:bg-primary/35 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-sky-500/15 dark:bg-accent/25 blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <img
            src={logoWatermark}
            alt=""
            width={1209}
            height={639}
            className="w-[min(92vw,64rem)] max-w-none object-contain"
          />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-10 top-6 h-44 w-44 rounded-full border-[24px] border-accent/20" aria-hidden="true" />
      <div className="container relative z-10 py-10 sm:py-14 md:py-20">
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
                "bg-accent text-accent-foreground font-extrabold shadow-lg hover:bg-accent/90 ring-2 ring-accent/30 text-base sm:text-lg px-8 py-4 rounded-xl transition-all"
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
