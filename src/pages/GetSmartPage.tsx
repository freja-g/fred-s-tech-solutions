import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

import { motion } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import tipRestart from "@/assets/tip-restart.jpg";
import tipWifi from "@/assets/tip-wifi.jpg";
import tipSlow from "@/assets/tip-slow.jpg";

const STATIC_GUIDES = [
  {
    image: tipRestart,
    title: "Computer not responding? Restart the smart way",
    summary: "Most freezes vanish after a proper restart.",
    body: "1. Save anything open (Ctrl + S on Windows, Cmd + S on Mac).\n2. Close apps one by one, starting with the heaviest.\n3. Click Start, Power, Restart (not just Shut Down).\n4. If frozen completely: hold the power button for 10 seconds, wait 30 seconds, power back on.",
  },
  {
    image: tipWifi,
    title: "WiFi is slow or keeps dropping",
    summary: "A 2-minute reset to try before calling your provider.",
    body: "1. Unplug your router from the wall socket.\n2. Wait a full 60 seconds (this clears router memory).\n3. Plug it back in and wait 2–3 minutes for all lights to settle.\n4. Reconnect your device. Still slow? Move closer to the router or restart your device.",
  },
];

const GetSmartPage = () => {
  const [open, setOpen] = useState<number | null>(0);
  const [guides, setGuides] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("get_smart_content").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        const dynamic = (data || []).map(d => ({
          image: d.image_url || tipSlow,
          title: d.title,
          summary: d.body.substring(0, 100) + "...",
          body: d.body
        }));
        setGuides([...STATIC_GUIDES, ...dynamic]);
      });
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="md:pt-20 pt-4">
        {/* Sub-header Tabs matching PDF */}
        <div className="border-b border-border bg-card">
          <div className="container flex items-center gap-6">
            <Link
              to="/services"
              className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              to="/get-smart"
              className="py-3 text-sm font-bold text-accent border-b-2 border-accent"
            >
              Get Smart
            </Link>
          </div>
        </div>

        <section className="section-padding py-6">
          <div className="container max-w-4xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-1"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                WHAT'S NEXT
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Tips and technology trends from the GiCOFix team.
              </h1>
            </motion.div>

            <div className="pt-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Simple fixes, no tech skills needed
              </h2>

              <div className="space-y-3">
                {guides.map((g, i) => {
                  const isOpen = open === i;
                  return (
                    <motion.article
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                    >
                      <button
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3"
                      >
                        <div>
                          <h3 className="font-semibold text-base leading-snug">{g.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{g.summary}</p>
                        </div>
                        <ChevronDown
                          size={18}
                          className={cn("text-muted-foreground transition-transform flex-shrink-0", isOpen && "rotate-180")}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-border text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {g.body}
                        </div>
                      )}
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GetSmartPage;
