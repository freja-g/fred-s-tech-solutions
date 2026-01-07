import { Button } from "@/components/ui/button";
import { Settings, Wrench, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

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
];

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="section-padding bg-secondary/50">
      <div className="container">
        <motion.div 
          ref={ref}
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
            Services
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            How I can help
          </h2>
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
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
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
              
              <Button variant="outline" className="w-full group/btn" asChild>
                <a href="#contact">
                  Get Started
                  <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
