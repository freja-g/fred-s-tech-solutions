import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { TrendingUp, Zap, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Clock, ChartBar as BarChart3 } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "POS System Stabilization",
    category: "Hardware & System Optimization",
    icon: Zap,
    problem: "A retail business was losing $500+ daily due to POS system crashes during peak hours.",
    action: "Diagnosed hardware bottlenecks, replaced failing components, optimized OS settings, and implemented monitoring.",
    result: "System uptime improved to 99.9%",
    metrics: [
      { label: "Uptime Improvement", value: "99.9%", change: "+98.5%" },
      { label: "Transaction Speed", value: "2.1s avg", change: "-40%" },
      { label: "Daily Downtime", value: "~1 min", change: "-99%" },
      { label: "ROI Timeline", value: "2 weeks", change: "Paid off" },
    ],
    tags: ["Hardware", "System Optimization", "Retail"],
    stats: { timeInvested: "24 hours", impact: "Very High", complexity: "Medium" },
  },
  {
    id: 2,
    title: "Workflow Automation Implementation",
    category: "Business Process Automation",
    icon: TrendingUp,
    problem: "A startup development team spent 15+ hours weekly on manual data entry and repetitive data processing tasks.",
    action: "Analyzed workflows, identified automation opportunities, built custom scripts, and trained team on new processes.",
    result: "Team reclaimed 15+ hours per week",
    metrics: [
      { label: "Time Saved Weekly", value: "15+ hrs", change: "+32% productivity" },
      { label: "Error Rate", value: "0.1%", change: "-99.5%" },
      { label: "Processing Speed", value: "10x faster", change: "+900%" },
      { label: "Annual Savings", value: "~$12K", change: "Efficiency gain" },
    ],
    tags: ["Automation", "Data Processing", "Startup"],
    stats: { timeInvested: "40 hours", impact: "Very High", complexity: "High" },
  },
  {
    id: 3,
    title: "Enterprise Performance Optimization",
    category: "IT Support & Troubleshooting",
    icon: AlertCircle,
    problem: "Individual consultant's workstation was severely underperforming with frequent crashes and slow response times.",
    action: "Performed comprehensive diagnostics, cleaned system resources, optimized drivers, and reconfigured software.",
    result: "Zero crashes in 3 months",
    metrics: [
      { label: "Boot Time", value: "15s", change: "-70%" },
      { label: "Crashes", value: "0", change: "-100%" },
      { label: "Responsiveness", value: "Excellent", change: "+85%" },
      { label: "Application Load", value: "3s avg", change: "-65%" },
    ],
    tags: ["IT Support", "Performance Tuning", "Workstation"],
    stats: { timeInvested: "16 hours", impact: "High", complexity: "Medium" },
  },
  {
    id: 4,
    title: "Technology Stack Evaluation",
    category: "Technical Consulting",
    icon: CheckCircle2,
    problem: "Growing business needed to select from 3 enterprise software platforms but lacked technical expertise.",
    action: "Conducted thorough feature analysis, cost comparison, scalability review, and integration assessment.",
    result: "Avoided $20K implementation mistake",
    metrics: [
      { label: "Cost Avoidance", value: "$20K", change: "Mistake prevented" },
      { label: "Implementation Time", value: "3 months", change: "Optimized" },
      { label: "Scalability Score", value: "9.2/10", change: "Future-proof" },
      { label: "ROI Timeline", value: "6 months", change: "Clear path" },
    ],
    tags: ["Consulting", "Software Evaluation", "Enterprise"],
    stats: { timeInvested: "32 hours", impact: "High", complexity: "High" },
  },
  {
    id: 5,
    title: "Network Security Hardening",
    category: "Network & Security",
    icon: BarChart3,
    problem: "Mid-size company had multiple security vulnerabilities and no disaster recovery plan in place.",
    action: "Conducted security audit, implemented firewall rules, configured backups, and established security protocols.",
    result: "Passed security compliance audit",
    metrics: [
      { label: "Vulnerabilities Fixed", value: "14/14", change: "100%" },
      { label: "Backup Frequency", value: "4x daily", change: "Continuous" },
      { label: "Recovery Time", value: "<1 hour", change: "Mission-critical" },
      { label: "Security Score", value: "92/100", change: "+47 pts" },
    ],
    tags: ["Security", "Network Setup", "Compliance"],
    stats: { timeInvested: "56 hours", impact: "Critical", complexity: "High" },
  },
  {
    id: 6,
    title: "Cloud Migration Strategy",
    category: "Cloud & Infrastructure",
    icon: Zap,
    problem: "Company running legacy on-premise systems facing rising infrastructure costs and limited scalability.",
    action: "Assessed cloud readiness, designed migration plan, executed phased transition, and optimized cloud costs.",
    result: "40% reduction in infrastructure costs",
    metrics: [
      { label: "Cost Reduction", value: "40%", change: "-$8K/month" },
      { label: "Migration Time", value: "8 weeks", change: "Zero downtime" },
      { label: "Scalability", value: "Unlimited", change: "On-demand" },
      { label: "Performance", value: "+25%", change: "Improved" },
    ],
    tags: ["Cloud Migration", "Infrastructure", "Cost Optimization"],
    stats: { timeInvested: "120 hours", impact: "Very High", complexity: "Very High" },
  },
];

const impactVisualization = (metrics: typeof projects[0]['metrics']) => {
  const maxValue = Math.max(...metrics.map(m => {
    const num = parseFloat(m.value);
    return isNaN(num) ? 0 : num;
  }));

  return (
    <div className="space-y-3 mt-4">
      {metrics.map((metric, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between items-end">
            <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
            <span className="text-sm font-semibold text-foreground">{metric.value}</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            />
          </div>
          <span className="text-xs text-accent font-medium">{metric.change}</span>
        </div>
      ))}
    </div>
  );
};

const ProjectsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-background">
          <div className="container">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
                Hands-On Projects & Experience
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                Real problems. Measurable solutions.
              </h1>
              <p className="text-muted-foreground">
                Detailed case studies demonstrating practical expertise and proven results across diverse technical challenges.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {projects.map((project, index) => {
                const Icon = project.icon;
                return (
                  <motion.div
                    key={project.id}
                    className="bg-card border border-border rounded-xl p-6 lg:p-8 hover:border-accent/30 transition-all duration-300 group relative overflow-hidden"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ scale: 1.01 }}
                  >
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -mr-10 -mt-10 group-hover:bg-accent/10 transition-colors" />

                    {/* Header with icon */}
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div>
                        <p className="text-xs font-medium text-accent uppercase tracking-wide mb-2">
                          {project.category}
                        </p>
                        <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                      </div>
                      <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                        <Icon className="text-accent" size={24} />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, tagIndex) => (
                        <motion.span
                          key={tagIndex}
                          className="text-xs font-medium px-2.5 py-1 bg-accent/10 text-accent rounded-full"
                          whileHover={{ scale: 1.05 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>

                    {/* Content sections */}
                    <div className="space-y-3 mb-4 relative z-10">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                          <AlertCircle size={14} />
                          Problem
                        </p>
                        <p className="text-sm text-foreground/80">{project.problem}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Clock size={14} />
                          Action Taken
                        </p>
                        <p className="text-sm text-foreground/80">{project.action}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-accent uppercase tracking-wide mb-1 flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          Result
                        </p>
                        <p className="text-sm font-semibold text-accent">{project.result}</p>
                      </div>
                    </div>

                    {/* Impact visualization */}
                    <div className="relative z-10">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Key Metrics</p>
                      {impactVisualization(project.metrics)}
                    </div>

                    {/* Stats footer */}
                    <div className="mt-4 pt-4 border-t border-border/50 relative z-10">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Time Invested</p>
                          <p className="text-sm font-semibold text-foreground">{project.stats.timeInvested}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Impact</p>
                          <p className={`text-sm font-semibold ${
                            project.stats.impact === "Critical" || project.stats.impact === "Very High"
                              ? "text-accent"
                              : "text-foreground"
                          }`}>
                            {project.stats.impact}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Complexity</p>
                          <p className="text-sm font-semibold text-foreground">{project.stats.complexity}</p>
                        </div>
                      </div>
                    </div>

                    {/* Decorative corner accent */}
                    <div className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg viewBox="0 0 64 64" className="w-full h-full">
                        <path d="M0 0 L64 0 L64 64" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.3" />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary stats */}
            <motion.div
              className="mt-16 grid md:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { label: "Projects Completed", value: "50+" },
                { label: "Avg Uptime Achieved", value: "99.8%" },
                { label: "Cost Savings Generated", value: "$200K+" },
                { label: "Client Satisfaction", value: "98%" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="bg-secondary/50 rounded-lg p-6 text-center border border-border/50 hover:border-accent/30 transition-colors"
                  whileHover={{ y: -5 }}
                >
                  <p className="text-accent font-semibold text-2xl md:text-3xl mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
