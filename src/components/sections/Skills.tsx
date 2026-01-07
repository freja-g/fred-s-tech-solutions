import { Monitor, Code, Database, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    icon: Monitor,
    title: "Hardware & Diagnostics",
    skills: [
      "System diagnostics and troubleshooting",
      "Hardware performance analysis",
      "Component compatibility assessment",
      "Upgrade path planning",
    ],
  },
  {
    icon: Code,
    title: "Software Development",
    skills: [
      "Foundational to intermediate programming",
      "Script automation",
      "Software configuration",
      "Integration development",
    ],
  },
  {
    icon: Database,
    title: "Data Analysis",
    skills: [
      "Data cleaning and organization",
      "Basic statistical analysis",
      "Reporting and visualization",
      "Spreadsheet optimization",
    ],
  },
  {
    icon: Zap,
    title: "System Optimization",
    skills: [
      "Performance tuning",
      "Resource management",
      "Workflow efficiency",
      "Preventive maintenance",
    ],
  },
];

const worksWith = [
  {
    title: "Small Businesses",
    description: "Get expert technical guidance without the overhead of a full-time IT department.",
  },
  {
    title: "Startups",
    description: "Make smart technology decisions early and build a foundation that scales.",
  },
  {
    title: "Individuals",
    description: "Solve technical problems and get clear answers to confusing tech questions.",
  },
  {
    title: "Technical Teams",
    description: "Add specialized expertise for specific projects or get a fresh perspective on challenges.",
  },
];

const Skills = () => {
  const skillsRef = useRef(null);
  const worksRef = useRef(null);
  const skillsInView = useInView(skillsRef, { once: true, margin: "-100px" });
  const worksInView = useInView(worksRef, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-secondary/50">
      <div className="container">
        {/* Skills */}
        <div className="mb-20">
          <motion.div 
            ref={skillsRef}
            className="text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
              Tools & Skills
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              What I bring to the table
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((category, index) => (
              <motion.div 
                key={index} 
                className="bg-card rounded-xl p-6 group"
                initial={{ opacity: 0, y: 30 }}
                animate={skillsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -3 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300"
                >
                  <category.icon className="text-accent group-hover:text-accent-foreground transition-colors" size={20} />
                </motion.div>
                <h3 className="font-semibold mb-3">{category.title}</h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="text-sm text-muted-foreground">
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Who I Work With */}
        <div ref={worksRef}>
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={worksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
              Who I Work With
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Is this right for you?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {worksWith.map((client, index) => (
              <motion.div 
                key={index} 
                className="text-center p-6 relative"
                initial={{ opacity: 0, y: 30 }}
                animate={worksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <motion.div 
                  className="absolute inset-0 bg-accent/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                />
                <h3 className="font-semibold mb-2 relative">{client.title}</h3>
                <p className="text-sm text-muted-foreground relative">{client.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
