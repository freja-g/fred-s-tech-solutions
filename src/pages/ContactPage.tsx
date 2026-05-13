import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const WHATSAPP_NUMBER = "254742123999"; // no '+' for wa.me
  const RECIPIENT_EMAIL = "wigatechnologies@gmail.com";

  const { name, email, message } = formData;
  const isComplete = name.trim() && email.trim() && message.trim();

  const composed = `New enquiry from Wiga Tech Solutions website:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(composed)}`;
  const mailtoHref = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(
    `Website enquiry from ${name || "website visitor"}`
  )}&body=${encodeURIComponent(composed)}`;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isComplete) {
      e.preventDefault();
      toast({
        title: "Please fill in all fields",
        description: "We need your name, email, and message before sending.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Opening...",
      description: "Just hit send to deliver your message.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="section-padding bg-background relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
            <svg viewBox="0 0 200 600" fill="none" className="w-full h-full">
              <circle cx="100" cy="100" r="80" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="120" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="160" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <circle cx="100" cy="300" r="60" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <circle cx="100" cy="300" r="100" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <circle cx="100" cy="500" r="70" stroke="hsl(var(--accent))" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="container relative z-10">
            <motion.div 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-12">
                <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
                  Contact Us
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                  Let's solve your problem
                </h1>
                <p className="text-muted-foreground">
                  Describe what you're dealing with. I'll review your message and get back to you 
                  with next steps—usually within one business day.
                </p>
              </div>

              <motion.div 
                className="bg-card border border-border rounded-xl p-6 md:p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        maxLength={100}
                        className="transition-all duration-200 focus:ring-accent focus:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        maxLength={255}
                        className="transition-all duration-200 focus:ring-accent focus:border-accent"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">What can I help with?</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell me about the technical challenge you're facing. The more detail, the better I can assess how to help."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      maxLength={2000}
                      className="transition-all duration-200 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Choose how to send your message:
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button asChild variant="accent" size="lg" className="w-full">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                      >
                        <MessageCircle className="mr-2" size={18} />
                        Send via WhatsApp
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <a href={mailtoHref} onClick={handleLinkClick}>
                        <Mail className="mr-2" size={18} />
                        Send via Email
                      </a>
                    </Button>
                  </div>
                </form>
              </motion.div>

              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <p className="text-muted-foreground text-sm mb-2">
                  Prefer email directly?
                </p>
                <a
                  href={`mailto:${RECIPIENT_EMAIL}`}
                  className="inline-flex items-center gap-2 text-accent hover:underline font-medium group"
                >
                  <Mail size={16} className="group-hover:scale-110 transition-transform" />
                  {RECIPIENT_EMAIL}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
