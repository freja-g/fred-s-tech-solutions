import { Monitor, Code, Database, Zap } from "lucide-react";

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
  return (
    <section className="section-padding bg-secondary/50">
      <div className="container">
        {/* Skills */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
              Tools & Skills
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              What I bring to the table
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((category, index) => (
              <div key={index} className="bg-card rounded-xl p-6">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <category.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-semibold mb-3">{category.title}</h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="text-sm text-muted-foreground">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Who I Work With */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
              Who I Work With
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Is this right for you?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {worksWith.map((client, index) => (
              <div key={index} className="text-center p-6">
                <h3 className="font-semibold mb-2">{client.title}</h3>
                <p className="text-sm text-muted-foreground">{client.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
