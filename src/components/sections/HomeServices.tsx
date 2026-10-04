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
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent md:text-sm"><Briefcase size={14} /> Our Services</p>
            <h2 id="home-services-title" className="text-2xl font-semibold md:text-4xl">How we can help</h2>
          </div>
          <Link to="/services" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>View all <ArrowRight size={16} /></Link>
        </motion.div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {services.map((service, index) => {
            const media = service.media_url || fallbackMedia[index % fallbackMedia.length];
            return (
              <article key={service.id} className="flex w-[84%] shrink-0 snap-center flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card sm:w-auto">
                <div className="aspect-[16/10] overflow-hidden bg-secondary">
                  {isVideo(media) ? (
                    <video src={media} className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" aria-label={`${service.title} video`} />
                  ) : (
                    <img src={media} alt={service.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
                  <p className="mb-5 line-clamp-3 flex-1 text-sm text-muted-foreground">{service.description}</p>
                  <Link to={`/book?service=${encodeURIComponent(service.title)}&service_id=${service.id}`} className={cn(buttonVariants({ variant: "accent" }), "w-full")}>Book Consultation <ArrowRight size={16} /></Link>
                </div>
              </article>
            );
          })}
        </div>
        <Link to="/services" className={cn(buttonVariants({ variant: "outline" }), "mt-5 w-full sm:hidden")}>View all services <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
};

export default HomeServices;