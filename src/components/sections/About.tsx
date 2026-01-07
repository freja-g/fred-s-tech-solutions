import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container">
        <motion.div 
          ref={ref}
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
        >
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

          <motion.div 
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { value: "10+", label: "Years of Experience" },
              { value: "50+", label: "Clients Helped" },
              { value: "100%", label: "Practical Focus" },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 bg-secondary rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-3xl font-semibold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
