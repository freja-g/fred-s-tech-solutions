import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

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
    <section id="contact" className="section-padding bg-background">
      <div className="container">
        <div className="max-w-2xl mx-auto">
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

          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
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
                />
              </div>
              
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
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm mb-2">
              Prefer email directly?
            </p>
            <a
              href="mailto:hello@fredconsulting.com"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              <Mail size={16} />
              hello@fredconsulting.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
