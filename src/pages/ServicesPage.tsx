import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Settings,
  Wrench,
  ChartBar as BarChart3,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
const supabase = supabaseClient as any;
import { useAuth } from "@/hooks/useAuth";

const ICONS: Record<string, any> = { Settings, Wrench, BarChart3, Briefcase };

const DEFAULT_SERVICES = [
  {
    id: "default-1",
    icon_name: "Settings",
    title: "Technical Consulting",
    description:
      "Get clear guidance on technology decisions, system architecture, and optimization strategies.",
    features: [
      "System and infrastructure reviews",
      "Technology stack recommendations",
      "Performance optimization strategies",
      "Vendor and tool evaluation",
    ],
  },
  {
    id: "default-2",
    icon_name: "Wrench",
    title: "IT Support & Troubleshooting",
    description:
      "When things break or slow down, you need solutions fast. We diagnose and resolve hardware and software issues.",
    features: [
      "Hardware diagnostics and repair guidance",
      "Software troubleshooting",
      "System performance tuning",
      "Preventive maintenance planning",
    ],
  },
  {
    id: "default-3",
    icon_name: "BarChart3",
    title: "Data & Software Support",
    description:
      "Turn your data into useful insights and keep your software running smoothly.",
    features: [
      "Data analysis and reporting",
      "Software configuration and setup",
      "Workflow automation basics",
      "Integration troubleshooting",
    ],
  },
  {
    id: "default-4",
    icon_name: "Settings",
    title: "Network Setup & Security",
    description:
      "Secure your infrastructure and ensure reliable connectivity, from network design to security hardening.",
    features: [
      "Network architecture design",
      "Security audits and hardening",
      "Firewall and access control",
      "Backup and disaster recovery",
    ],
  },
  {
    id: "default-5",
    icon_name: "Wrench",
    title: "Cloud Migration & Management",
    description:
      "Move your systems to the cloud safely and efficiently. We guide you through the process end-to-end.",
    features: [
      "Cloud readiness assessment",
      "Migration planning and execution",
      "Cost optimization strategies",
      "Cloud infrastructure management",
    ],
  },
  {
    id: "default-6",
    icon_name: "BarChart3",
    title: "Business Process Automation",
    description:
      "Eliminate manual work and boost productivity by automating repetitive tasks.",
    features: [
      "Workflow automation design",
      "Process optimization analysis",
      "Integration of business tools",
      "Custom automation solutions",
    ],
  },
];

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon_name?: string | null;
  features?: string[];
  isCustom?: boolean;
};

const ServicesPage = () => {
  const { isAdmin, isTechnician } = useAuth();
  const isStaff = isAdmin || isTechnician;

  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });
      const custom: ServiceItem[] = (data || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        icon_name: s.icon_name,
        isCustom: true,
      }));
      setServices([...custom, ...DEFAULT_SERVICES]);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="md:pt-20 pt-4">
        <section className="section-padding bg-secondary/50">
          <div className="container">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
                What we love doing
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                Tech help that gets you excited again
              </h1>
              <p className="text-muted-foreground">
                We don't just fix problems — we turn them into wins. Every service below is built to
                save you time, cut frustration, and unlock what your business can really do.
              </p>
              {isStaff && (
                <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    to="/admin/content"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Manage services
                  </Link>
                </div>
              )}
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const Icon = ICONS[service.icon_name || "Briefcase"] || Briefcase;

                return (
                  <motion.div
                    key={service.id}
                    className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Icon className="text-accent" size={22} />
                      </div>
                      {service.isCustom && (
                        <Badge variant="outline" className="text-[10px]">Custom</Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">
                      {service.description}
                    </p>

                    {service.features && (
                      <ul className="space-y-1.5 mb-5">
                        {service.features.map((f, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="mt-1.5 block w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      to={`/book?service=${encodeURIComponent(service.title)}&service_id=${service.id}`}
                      className={cn(
                        buttonVariants({ variant: "accent" }),
                        "w-full group/btn"
                      )}
                    >
                      Let's Get Started!
                      <ArrowRight
                        className="ml-2 group-hover/btn:translate-x-1 transition-transform"
                        size={16}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ServicesPage;
