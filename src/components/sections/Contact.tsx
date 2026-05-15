import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="section-padding bg-secondary/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
        <svg viewBox="0 0 200 600" fill="none" className="w-full h-full">
          <circle cx="100" cy="100" r="80" stroke="hsl(var(--accent))" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="120" stroke="hsl(var(--accent))" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="160" stroke="hsl(var(--accent))" strokeWidth="0.5" />
          <circle cx="100" cy="300" r="60" stroke="hsl(var(--accent))" strokeWidth="0.5" />
          <circle cx="100" cy="300" r="100" stroke="hsl(var(--accent))" strokeWidth="0.5" />
          <circle cx="100" cy="500" r="70" stroke="hsl(var(--accent))" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="container relative z-10">
        <motion.div
          ref={ref}
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
            Ready to get started?
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Book a consultation with our team
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Share your technical needs and choose how you'd like to connect with us.
            We'll respond quickly and provide the support you need.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/contact"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Book a Consultation
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
