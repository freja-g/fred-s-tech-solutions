
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Camera, Image as ImageIcon, X } from "lucide-react";
import { uploadImage } from "@/lib/storage";

const BookingPage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleAddImage = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to upload photos." });
      return;
    }
    const url = await uploadImage("attachments", `consultations/${user.id}`);
    if (url) setImages([...images, url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      nav("/auth");
      return;
    }
    if (!subject || !description) return;

    setBusy(true);
    const { error } = await supabase.from("consultations").insert({
      customer_id: user.id,
      subject,
      description,
      attachment_urls: images,
      status: "pending"
    });

    setBusy(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Consultation booked. A technician will review it shortly." });
      nav("/messages");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16 container max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Book a Consultation</h1>
        <p className="text-muted-foreground mb-8">Tell us about your technical issue or project needs.</p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border p-6 rounded-xl shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g. Broken Laptop Screen, Network Setup" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Problem Description</Label>
            <Textarea id="desc" placeholder="Please provide details about what's happening..." rows={6} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div className="space-y-3">
            <Label>Photos (Optional)</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded border overflow-hidden">
                  <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                  <button onClick={() => setImages(images.filter((_, idx) => i !== idx))} className="absolute top-0 right-0 p-0.5 bg-black/50 text-white rounded-bl">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImage}
                className="w-20 h-20 rounded border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
              >
                <Camera size={20} />
                <span className="text-[10px] mt-1">Add Photo</span>
              </button>
            </div>
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={busy}>
            {busy ? "Booking..." : "Submit Consultation Request"}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
