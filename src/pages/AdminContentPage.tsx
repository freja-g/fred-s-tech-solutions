
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, Edit2, Lightbulb, Briefcase, Camera, Video, X } from "lucide-react";
import { uploadMedia } from "@/lib/storage";

const AdminContentPage = () => {
  const { isAdmin, isTechnician } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const [newService, setNewService] = useState({ title: "", description: "", icon_name: "Briefcase" });
  const [newTip, setNewTip] = useState({ title: "", body: "", category: "Tech Tip", image_url: "" });

  const isStaff = isAdmin || isTechnician;

  const fetchContent = async () => {
    const { data: s } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    const { data: t } = await supabase.from("get_smart_content").select("*").order("created_at", { ascending: false });
    setServices(s || []);
    setTips(t || []);
  };

  useEffect(() => {
    if (isStaff) fetchContent();
  }, [isStaff]);

  const handleAddService = async () => {
    setBusy(true);
    const { error } = await supabase.from("services").insert(newService);
    setBusy(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Success", description: "Service added successfully" });
      setNewService({ title: "", description: "", icon_name: "Briefcase" });
      fetchContent();
    }
  };

  const handleAddTip = async () => {
    setBusy(true);
    const { error } = await supabase.from("get_smart_content").insert(newTip);
    setBusy(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Success", description: "Tip added successfully" });
      setNewTip({ title: "", body: "", category: "Tech Tip", image_url: "" });
      fetchContent();
    }
  };

  const handleUploadTipMedia = async (type: 'image' | 'video') => {
    const url = await uploadMedia("attachments", "content", type);
    if (url) setNewTip({ ...newTip, image_url: url });
  };

  const handleDelete = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Deleted", description: "Item removed" });
      fetchContent();
    }
  };

  if (!isStaff) return <div className="p-20 text-center">Unauthorized</div>;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16 container max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Content Management</h1>

        <Tabs defaultValue="services">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="tips">Get Smart Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Service</CardTitle>
                <CardDescription>Create a technical service offer for customers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Title" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} />
                <Textarea placeholder="Description" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                <Button onClick={handleAddService} disabled={busy} className="w-full"><Plus className="mr-2" size={16} /> Add Service</Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {services.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete("services", s.id)}><Trash2 size={16} className="text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Tip</CardTitle>
                <CardDescription>Share technical knowledge with your users. You can include a photo or video.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Title" value={newTip.title} onChange={e => setNewTip({...newTip, title: e.target.value})} />
                <Textarea placeholder="Body Content" value={newTip.body} onChange={e => setNewTip({...newTip, body: e.target.value})} />

                <div className="space-y-2">
                   <p className="text-sm font-medium">Tip Media</p>
                   {newTip.image_url ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                         {newTip.image_url.includes('.mp4') ? (
                           <video src={newTip.image_url} controls className="w-full h-full object-cover" />
                         ) : (
                           <img src={newTip.image_url} className="w-full h-full object-cover" alt="Tip Media" />
                         )}
                         <button onClick={() => setNewTip({...newTip, image_url: ""})} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full">
                           <X size={16} />
                         </button>
                      </div>
                   ) : (
                      <div className="flex gap-3">
                         <Button type="button" variant="outline" onClick={() => handleUploadTipMedia('image')} className="flex-1">
                            <Camera className="mr-2" size={16} /> Add Photo
                         </Button>
                         <Button type="button" variant="outline" onClick={() => handleUploadTipMedia('video')} className="flex-1">
                            <Video className="mr-2" size={16} /> Add Video
                         </Button>
                      </div>
                   )}
                </div>

                <Button onClick={handleAddTip} disabled={busy} className="w-full"><Plus className="mr-2" size={16} /> Add Tip</Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {tips.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex gap-4 items-center">
                    {t.image_url && (
                       <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                         {t.image_url.includes('.mp4') ? <div className="w-full h-full bg-secondary flex items-center justify-center"><Video size={20} /></div> : <img src={t.image_url} className="w-full h-full object-cover" />}
                       </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{t.title}</h3>
                      <p className="text-sm text-muted-foreground truncate max-w-md">{t.body}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete("get_smart_content", t.id)}><Trash2 size={16} className="text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminContentPage;
