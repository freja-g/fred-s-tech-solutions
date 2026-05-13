import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-background">
          <div className="container">
            <motion.div 
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
                About
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mb-8">
                Technical expertise grounded in practical results
              </h1>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  At Wiga Tech Solutions, we provide technical consulting with a background spanning 
                  hardware diagnostics, software development, and data analysis. Our approach is 
                  simple: understand the problem, find the clearest solution, and make it work.
                </p>
                
                <p>
                  We've worked with small businesses struggling with outdated systems, startups 
                  needing technical direction, and individuals overwhelmed by tech decisions. 
                  In every case, the goal is the same—deliver outcomes that matter, not 
                  recommendations that gather dust.
                </p>
                
                <p>
                  What sets us apart is a commitment to clarity. We explain things in plain 
                  language, focus on what's actionable, and stay engaged until the problem 
                  is actually solved. No buzzwords. No upselling. Just technical help that 
                  makes a difference.
                </p>
              </div>

              <motion.div 
                className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
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
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
