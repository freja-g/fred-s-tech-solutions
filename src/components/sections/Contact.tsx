import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "Thanks for reaching out. I'll get back to you soon.",
    });
    
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="section-padding bg-background relative overflow-hidden">
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
          ref={ref}
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">
              Contact
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Let's solve your problem
            </h2>
            <p className="text-muted-foreground">
              Describe what you're dealing with. I'll review your message and get back to you 
              with next steps—usually within one business day.
            </p>
          </div>

          <motion.div 
            className="bg-card border border-border rounded-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
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
              
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button 
                  type="submit" 
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2" size={18} />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-muted-foreground text-sm mb-2">
              Prefer email directly?
            </p>
            <a
              href="mailto:hello@fredconsulting.com"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium group"
            >
              <Mail size={16} className="group-hover:scale-110 transition-transform" />
              hello@fredconsulting.com
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
