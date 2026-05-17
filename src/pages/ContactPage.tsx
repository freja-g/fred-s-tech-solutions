import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const SERVICES = [
  "Technical Consulting",
  "IT Support & Troubleshooting",
  "Data & Software Support",
  "Network Setup & Security",
  "Cloud Migration & Management",
  "Business Process Automation",
];

const WHATSAPP_NUMBER = "254742123999";
const RECIPIENT_EMAIL = "wigatechnologies@gmail.com";

const ContactPage = () => {
  const { toast } = useToast();
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
  });
  const [showInAppForm, setShowInAppForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"whatsapp" | "email" | "in_app" | null>(null);
  const isSubmitting = false;

  const { name, email, phone, service } = formData;
  const isComplete = name.trim() && email.trim() && phone.trim() && service.trim();

  const handleMethodSelect = (method: "whatsapp" | "email" | "in_app") => {
    if (!isComplete) {
      toast({
        title: "Please fill in all fields",
        description: "We need your name, email, phone, and service selection.",
        variant: "destructive",
      });
      return;
    }

    if (method === "in_app") {
      setShowInAppForm(true);
      setSelectedMethod(method);
    } else {
      setSelectedMethod(method);
      handleExternalSubmit(method);
    }
  };

  const handleExternalSubmit = (method: "whatsapp" | "email") => {
    const message = `New consultation request from Wiga Tech Solutions website:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}`;

    if (method === "whatsapp") {
      const whatsappHref = `https://wa.me/254742123999?text=${encodeURIComponent(message)}`;
      window.open(whatsappHref, "_blank");
    } else if (method === "email") {
      const mailtoHref = `mailto:wigatechnologies@gmail.com?subject=${encodeURIComponent(
        `Consultation Request from ${name}`
      )}&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoHref;
    }

    toast({
      title: "Redirecting...",
      description: "Your consultation request is ready to send.",
    });
  };

  const handleInAppSubmit = () => {
    toast({
      title: "Opening in-app messaging",
      description: "Sign in to chat directly with our team.",
    });
    nav("/messages");
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
                  Get Started
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                  Book a Consultation
                </h1>
                <p className="text-muted-foreground">
                  Share your details and let us know which service you need help with.
                  We'll get back to you as quickly as possible.
                </p>
              </div>

              <motion.div
                className="bg-card border border-border rounded-xl p-6 md:p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={100}
                      className="transition-all duration-200 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      maxLength={255}
                      className="transition-all duration-200 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 123 456 789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      maxLength={20}
                      className="transition-all duration-200 focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Service You Need</Label>
                    <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
                      <SelectTrigger id="service" className="transition-all duration-200 focus:ring-accent focus:border-accent">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICES.map((svc) => (
                          <SelectItem key={svc} value={svc}>
                            {svc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!showInAppForm && (
                    <>
                      <p className="text-xs text-muted-foreground text-center pt-4">
                        Choose how you'd like to connect with us:
                      </p>

                      <div className="grid sm:grid-cols-3 gap-3">
                        <button
                          onClick={() => handleMethodSelect("whatsapp")}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "w-full flex flex-col items-center"
                          )}
                        >
                          <MessageCircle className="mb-2" size={20} />
                          <span className="text-sm">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleMethodSelect("email")}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "w-full flex flex-col items-center"
                          )}
                        >
                          <Mail className="mb-2" size={20} />
                          <span className="text-sm">Email</span>
                        </button>
                        <button
                          onClick={() => handleMethodSelect("in_app")}
                          className={cn(
                            buttonVariants({ variant: "accent", size: "lg" }),
                            "w-full flex flex-col items-center"
                          )}
                        >
                          <Send className="mb-2" size={20} />
                          <span className="text-sm">Chat Here</span>
                        </button>
                      </div>
                    </>
                  )}

                  {showInAppForm && (
                    <motion.div
                      className="space-y-4 pt-4 border-t border-border"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm text-muted-foreground">
                        We'll respond to you via our in-app messaging system.
                        Our technician will review your request and get back to you shortly.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowInAppForm(false)}
                          className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                        >
                          Back
                        </button>
                        <button
                          onClick={handleInAppSubmit}
                          disabled={isSubmitting}
                          className={cn(buttonVariants({ variant: "accent" }), "flex-1")}
                        >
                          {isSubmitting ? "Submitting..." : "Submit Request"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
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
