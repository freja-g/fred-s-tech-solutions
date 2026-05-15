import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Settings, Wrench, ChartBar as BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Settings,
    title: "Technical Consulting",
    description:
      "Get clear guidance on technology decisions, system architecture, and optimization strategies. I review what you have, identify what's working and what isn't, and provide actionable recommendations.",
    features: [
      "System and infrastructure reviews",
      "Technology stack recommendations",
      "Performance optimization strategies",
      "Vendor and tool evaluation",
    ],
  },
  {
    icon: Wrench,
    title: "IT Support & Troubleshooting",
    description:
      "When things break or slow down, you need solutions fast. I diagnose and resolve hardware and software issues, improving reliability and getting you back to work.",
    features: [
      "Hardware diagnostics and repair guidance",
      "Software troubleshooting",
      "System performance tuning",
      "Preventive maintenance planning",
    ],
  },
  {
    icon: BarChart3,
    title: "Data & Software Support",
    description:
      "Turn your data into useful insights and keep your software running smoothly. From basic analysis to solving tricky software problems, I help you get more from your tools.",
    features: [
      "Data analysis and reporting",
      "Software configuration and setup",
      "Workflow automation basics",
      "Integration troubleshooting",
    ],
  },
  {
    icon: Settings,
    title: "Network Setup & Security",
    description:
      "Secure your infrastructure and ensure reliable connectivity. From network design to security hardening, I help protect your business from threats and downtime.",
    features: [
      "Network architecture design",
      "Security audits and hardening",
      "Firewall and access control configuration",
      "Backup and disaster recovery planning",
    ],
  },
  {
    icon: Wrench,
    title: "Cloud Migration & Management",
    description:
      "Move your systems to the cloud safely and efficiently. I guide you through the process and ensure smooth, secure operations in your cloud environment.",
    features: [
      "Cloud readiness assessment",
      "Migration planning and execution",
      "Cost optimization strategies",
      "Cloud infrastructure management",
    ],
  },
  {
    icon: BarChart3,
    title: "Business Process Automation",
    description:
      "Eliminate manual work and boost productivity. I automate repetitive tasks across your applications and systems, saving time and reducing errors.",
    features: [
      "Workflow automation design",
      "Process optimization analysis",
      "Integration of business tools",
      "Custom automation solutions",
    ],
  },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-secondary/50">
          <div className="container">
            <motion.div 
              className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
                Services
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                How I can help
              </h1>
              <p className="text-muted-foreground">
                Practical technical support tailored to your needs. 
                Each engagement focuses on delivering real, measurable improvements.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-xl p-6 lg:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col group"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors"
                    whileHover={{ rotate: 5 }}
                  >
                    <service.icon className="text-accent" size={24} />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-5 flex-grow">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-accent mt-1.5 block w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/contact"
                    className={cn(buttonVariants({ variant: "outline" }), "w-full group/btn text-center")}
                  >
                    Book Now
                    <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
