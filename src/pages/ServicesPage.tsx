import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Settings,
  Wrench,
  ChartBar as BarChart3,
  ArrowRight,
  Briefcase,
  Users,
  Clock,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

type Consultation = {
  id: string;
  customer_id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  service_id: string | null;
  profile?: { display_name: string | null; email: string | null } | null;
};

const ServicesPage = () => {
  const { isAdmin, isTechnician, user } = useAuth();
  const isStaff = isAdmin || isTechnician;

  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isStaff) return;
    (async () => {
      const { data: cs } = await supabase
        .from("consultations")
        .select("id, customer_id, subject, description, status, created_at, service_id")
        .order("created_at", { ascending: false });
      const list = (cs || []) as Consultation[];
      const ids = Array.from(new Set(list.map(c => c.customer_id)));
      let profileMap: Record<string, any> = {};
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name, email")
          .in("user_id", ids);
        (profs || []).forEach((p: any) => {
          profileMap[p.user_id] = { display_name: p.display_name, email: p.email };
        });
      }
      setConsultations(list.map(c => ({ ...c, profile: profileMap[c.customer_id] || null })));
    })();
  }, [isStaff, user?.id]);

  const consultationsFor = (s: ServiceItem) => {
    if (s.isCustom) return consultations.filter(c => c.service_id === s.id);
    // For default services, match by subject containing keyword from title
    const key = s.title.split(/\s|&/)[0].toLowerCase();
    return consultations.filter(
      c => !c.service_id && (c.subject.toLowerCase().includes(key) || s.title.toLowerCase().includes(key))
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
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
                  <Badge variant="secondary" className="text-xs">
                    Admin view — tap a service to see customer requests
                  </Badge>
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
                const open = expanded === service.id;
                const issues = isStaff ? consultationsFor(service) : [];

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

                    {isStaff ? (
                      <>
                        <Button
                          variant="accent"
                          className="w-full justify-between"
                          onClick={() => setExpanded(open ? null : service.id)}
                        >
                          <span className="flex items-center gap-2">
                            <Users size={16} />
                            {issues.length} customer{issues.length === 1 ? "" : "s"} with issues
                          </span>
                          <ChevronDown
                            size={16}
                            className={cn("transition-transform", open && "rotate-180")}
                          />
                        </Button>

                        <AnimatePresence>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 space-y-2">
                                {issues.length === 0 && (
                                  <p className="text-xs text-muted-foreground text-center py-4">
                                    No customer requests for this service yet.
                                  </p>
                                )}
                                {issues.map(c => (
                                  <Link
                                    key={c.id}
                                    to="/admin/consultations"
                                    className="block bg-secondary/60 hover:bg-secondary rounded-lg p-3 transition-colors"
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <p className="text-sm font-medium truncate">
                                        {c.profile?.display_name || c.profile?.email || "Customer"}
                                      </p>
                                      <Badge
                                        variant={c.status === "pending" ? "outline" : "default"}
                                        className="text-[10px] flex-shrink-0"
                                      >
                                        {c.status}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {c.subject}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                      <Clock size={10} />
                                      {new Date(c.created_at).toLocaleDateString()}
                                    </p>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={`/book?service=${encodeURIComponent(service.title)}`}
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
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
