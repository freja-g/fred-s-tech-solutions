
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import { useAuth } from "@/hooks/useAuth";
import { Camera, Image as ImageIcon, X, Video } from "lucide-react";
import { uploadMedia } from "@/lib/storage";

const BookingPage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<string[]>([]);

  const handleUploadMedia = async (type: 'image' | 'video') => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to upload photos or videos." });
      return;
    }
    const url = await uploadMedia("attachments", `consultations/${user.id}`, type);
    if (url) setMedia([...media, url]);
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
      attachment_urls: media,
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
        <p className="text-muted-foreground mb-8">Tell us about your technical issue or project needs. Photos or videos (max 50MB) help us understand better.</p>

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
            <Label>Attachments (Optional - Photos/Videos max 50MB)</Label>
            <div className="flex flex-wrap gap-3">
              {media.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded border overflow-hidden bg-secondary">
                  {url.includes('.mp4') ? (
                    <video src={url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => setMedia(media.filter((_, idx) => i !== idx))} className="absolute top-0 right-0 p-1 bg-black/50 text-white rounded-bl">
                    <X size={14} />
                  </button>
                  {url.includes('.mp4') && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Video size={20} className="text-white drop-shadow-md" /></div>}
                </div>
              ))}
              <div className="flex gap-2">
                 <button
                  type="button"
                  onClick={() => handleUploadMedia('image')}
                  className="w-24 h-24 rounded border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <Camera size={24} />
                  <span className="text-[10px] mt-1">Add Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadMedia('video')}
                  className="w-24 h-24 rounded border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <Video size={24} />
                  <span className="text-[10px] mt-1">Add Video</span>
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={busy}>
            {busy ? "Booking..." : "Submit Consultation Request"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default BookingPage;
