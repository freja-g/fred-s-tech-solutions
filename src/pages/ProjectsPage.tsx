import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import posImg from "@/assets/project-pos.jpg";
import automationImg from "@/assets/project-automation.jpg";
import itImg from "@/assets/project-itsupport.jpg";
import networkImg from "@/assets/project-network.jpg";
import cloudImg from "@/assets/project-cloud.jpg";
import consultingImg from "@/assets/project-consulting.jpg";

const projects = [
  {
    image: posImg,
    title: "POS System Stabilization",
    category: "Hardware & System Optimization",
    summary: "Diagnosed hardware bottlenecks and stabilized a failing retail POS system, taking uptime from frequent crashes to 99.9%.",
    tags: ["Hardware", "Retail", "Optimization"],
  },
  {
    image: automationImg,
    title: "Workflow Automation",
    category: "Business Process Automation",
    summary: "Built custom automation scripts that eliminated repetitive data entry, saving the client 15+ hours every week.",
    tags: ["Automation", "Productivity"],
  },
  {
    image: itImg,
    title: "IT Support & PC Tune-Up",
    category: "IT Support & Troubleshooting",
    summary: "Comprehensive diagnostics, driver optimization, and configuration cleanup that eliminated crashes and cut boot time by 70%.",
    tags: ["IT Support", "Performance"],
  },
  {
    image: networkImg,
    title: "Network Security Hardening",
    category: "Network & Security",
    summary: "Closed 14 vulnerabilities, configured firewalls and backups, and helped the client pass a security compliance audit.",
    tags: ["Security", "Networking"],
  },
  {
    image: cloudImg,
    title: "Cloud Migration",
    category: "Cloud & Infrastructure",
    summary: "Phased migration from on-prem to cloud with zero downtime, reducing infrastructure costs by 40%.",
    tags: ["Cloud", "Cost Reduction"],
  },
  {
    image: consultingImg,
    title: "Technology Stack Evaluation",
    category: "Technical Consulting",
    summary: "Independent evaluation of three software platforms — clear recommendation that avoided a $20K wrong investment.",
    tags: ["Consulting", "Strategy"],
  },
];

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
                Our Solutions
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                Solutions we deliver
              </h1>
              <p className="text-muted-foreground">
                A look at the kinds of problems we solve and the results we've delivered.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {projects.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-xl overflow-hidden group hover:border-accent/40 transition-colors"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={p.image}
                      alt={p.title}
                      width={1024}
                      height={640}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wide text-accent font-medium mb-2">{p.category}</p>
                    <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{p.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-16 text-center bg-card border border-border rounded-xl p-8 md:p-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl md:text-3xl font-semibold mb-3">Have a similar challenge?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Message us directly through the app — we'll respond as soon as possible.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/messages" className={cn(buttonVariants({ variant: "accent", size: "lg" }))}>
                  Message Us
                </Link>
                <Link to="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  Book a Consultation
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
