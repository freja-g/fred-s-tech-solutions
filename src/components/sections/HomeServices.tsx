import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import consultingImage from "@/assets/project-consulting.jpg";
import supportImage from "@/assets/project-itsupport.jpg";
import networkImage from "@/assets/project-network.jpg";
import cloudImage from "@/assets/project-cloud.jpg";
import automationImage from "@/assets/project-automation.jpg";
import posImage from "@/assets/project-pos.jpg";

const supabase = supabaseClient as any;
const fallbackMedia = [consultingImage, supportImage, networkImage, cloudImage, automationImage, posImage];
const defaultServices = [
  { id: "default-1", title: "Technical Consulting", description: "Clear guidance for better technology decisions and reliable systems." },
  { id: "default-2", title: "IT Support & Troubleshooting", description: "Fast diagnosis and practical fixes for hardware and software problems." },
  { id: "default-3", title: "Network Setup & Security", description: "Reliable connectivity, safer access, backups and network protection." },
  { id: "default-4", title: "Cloud Migration & Management", description: "Move and manage your business systems in the cloud with confidence." },
  { id: "default-5", title: "Business Process Automation", description: "Save time by turning repetitive work into simple automated flows." },
  { id: "default-6", title: "Business Systems Support", description: "Setup and support for the digital tools that keep your business moving." },
];

type Service = { id: string; title: string; description: string; media_url?: string | null };
const isVideo = (url: string) => /\.(mp4|webm|mov|m4v)(?:\?|#|$)/i.test(url);

const HomeServices = () => {
  const [services, setServices] = useState<Service[]>(defaultServices);

  useEffect(() => {
    let active = true;
    const loadServices = async () => {
      const { data, error } = await supabase.from("services").select("id, title, description, media_url").order("created_at", { ascending: false });
      if (active && !error && data?.length) setServices(data);
    };
    loadServices();
    return () => { active = false; };
  }, []);

  return (
    <section className="section-padding" aria-labelledby="home-services-title">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6 flex items-center justify-between gap-4 md:mb-8">
          <div>
            <h2 id="home-services-title" className="text-2xl font-bold md:text-3xl">Our Services</h2>
          </div>
          <Link to="/services" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">See all <ArrowRight size={14} /></Link>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            return (
              <article key={service.id} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                <h3 className="mb-1 text-lg font-semibold">{service.title}</h3>
                <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                <Link to={`/book?service=${encodeURIComponent(service.title)}&service_id=${service.id}`} className={cn(buttonVariants({ variant: "accent" }), "w-full justify-between")}>
                  Start <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeServices;