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
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
const supabase = supabaseClient as any;
import { useAuth } from "@/hooks/useAuth";
import ServiceAdvisor from "@/components/sections/ServiceAdvisor";

const ICONS: Record<string, any> = { Settings, Wrench, BarChart3, Briefcase };

const DEFAULT_SERVICES = [
  {
    id: "default-1",
    icon_name: "Settings",
    title: "Technical Consulting",
    description: "System reviews, tech stack, optimization",
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
    description: "Hardware diagnostics and repair guidance",
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
    description: "Data analysis, setup, automation basics",
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
    description: "Network design, audits, backup",
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
    description: "Readiness, migration, cost strategy",
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
    description: "Workflow design and integrations",
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
  const [showHelper, setShowHelper] = useState(false);

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
    <div className="min-h-screen pb-20">
      <Header />
      <main className="md:pt-20 pt-4">
        {/* Top Sub-Header Tabs matching PDF */}
        <div className="border-b border-border bg-card">
          <div className="container flex items-center gap-6">
            <Link
              to="/services"
              className="py-3 text-sm font-bold text-accent border-b-2 border-accent"
            >
              Services
            </Link>
            <Link
              to="/get-smart"
              className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Get Smart
            </Link>
          </div>
        </div>

        <section className="section-padding py-6">
          <div className="container max-w-4xl space-y-6">
            {/* Helper Callout matching PDF */}
            <div className="rounded-xl border border-accent/20 bg-accent/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="p-2 rounded-full bg-accent text-accent-foreground shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-sm sm:text-base text-foreground">
                    Not sure what you need?
                  </h2>
                  <p className="text-xs text-muted-foreground">Ask our helper</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelper(!showHelper)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full sm:w-auto")}
              >
                {showHelper ? "Hide Helper" : "Ask Helper"}
              </button>
            </div>

            {showHelper && !isStaff && <ServiceAdvisor services={services} />}

            {isStaff && (
              <div className="flex justify-end">
                <Link
                  to="/admin/content"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Manage services
                </Link>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service, index) => {
                return (
                  <motion.div
                    key={service.id}
                    className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.04 * index }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold">{service.title}</h3>
                        {service.isCustom && (
                          <Badge variant="outline" className="text-[10px]">Custom</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                        {service.description}
                      </p>
                    </div>

                    <Link
                      to={`/book?service=${encodeURIComponent(service.title)}&service_id=${service.id}`}
                      className={cn(buttonVariants({ variant: "accent" }), "w-full justify-between mt-2")}
                    >
                      Start
                      <ArrowRight size={16} />
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
