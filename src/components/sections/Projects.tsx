const projects = [
  {
    problem: "A small retail business was losing sales due to an unreliable POS system that crashed during peak hours.",
    action: "Diagnosed hardware bottlenecks, recommended cost-effective upgrades, and configured a more stable software setup.",
    result: "System uptime improved to 99.9%, and transaction processing time dropped by 40%.",
    tags: ["Hardware", "System Optimization"],
  },
  {
    problem: "A startup's development team was spending too much time on manual data entry and repetitive tasks.",
    action: "Analyzed their workflow, identified automation opportunities, and set up basic scripts to handle routine data processing.",
    result: "The team reclaimed 15+ hours per week, allowing them to focus on core product development.",
    tags: ["Data", "Automation"],
  },
  {
    problem: "An individual consultant struggled with slow computer performance and frequent software crashes.",
    action: "Performed comprehensive diagnostics, cleaned up system resources, and optimized software configurations.",
    result: "Boot time reduced by 70%, and the consultant reported zero crashes over the following three months.",
    tags: ["IT Support", "Performance"],
  },
  {
    problem: "A growing business needed to choose between three different software platforms but lacked technical expertise to evaluate them.",
    action: "Conducted a thorough comparison based on their specific needs, budget, and growth plans, then presented findings in plain language.",
    result: "Client made a confident decision, avoided a $20K mistake, and implemented a solution that scaled with their growth.",
    tags: ["Consulting", "Software"],
  },
];

const Projects = () => {
  return (
    <section id="projects" className="section-padding bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
            Projects & Experience
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Real problems. Real solutions.
          </h2>
          <p className="text-muted-foreground">
            A selection of engagements that demonstrate my practical, results-driven approach.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 lg:p-8 hover:border-accent/30 transition-colors"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="text-xs font-medium px-2.5 py-1 bg-accent/10 text-accent rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Problem
                  </p>
                  <p className="text-foreground text-sm">{project.problem}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Action
                  </p>
                  <p className="text-foreground text-sm">{project.action}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Result
                  </p>
                  <p className="text-accent font-medium text-sm">{project.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
