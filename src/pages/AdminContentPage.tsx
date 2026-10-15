
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, Camera, Video, X } from "lucide-react";
import { uploadMedia } from "@/lib/storage";

const AdminContentPage = () => {
  const { isAdmin, isTechnician } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const [newService, setNewService] = useState({ title: "", description: "", icon_name: "Briefcase", media_url: "" });
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
      setNewService({ title: "", description: "", icon_name: "Briefcase", media_url: "" });
      fetchContent();
    }
  };

  const handleUploadServiceMedia = async (type: 'image' | 'video') => {
    const url = await uploadMedia("attachments", "services", type);
    if (url) setNewService({ ...newService, media_url: url });
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
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 container max-w-4xl py-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-foreground">Content Management</h1>

        <Tabs defaultValue="services">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="services" className="text-xs font-bold">Services</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs font-bold">Get Smart</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs font-bold">Reviews Management</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <Card className="border border-border shadow-sm">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-lg font-bold">Add a service</CardTitle>
                <CardDescription className="text-xs">Create a service offer for customers.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Service name</label>
                  <Input
                    placeholder="e.g. Network Setup & Security"
                    value={newService.title}
                    onChange={e => setNewService({...newService, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Description</label>
                  <Textarea
                    placeholder="What the service includes…"
                    rows={3}
                    value={newService.description}
                    onChange={e => setNewService({...newService, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Service photo or video</p>
                  {newService.media_url ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-secondary">
                      {/\.(mp4|webm|mov|m4v)(?:\?|#|$)/i.test(newService.media_url) ? (
                        <video src={newService.media_url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
                      ) : (
                        <img src={newService.media_url} className="h-full w-full object-cover" alt="New service preview" />
                      )}
                      <Button type="button" variant="secondary" size="icon" aria-label="Remove service media" onClick={() => setNewService({ ...newService, media_url: "" })} className="absolute right-2 top-2"><X size={16} /></Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button type="button" variant="outline" className="font-bold text-xs" onClick={() => handleUploadServiceMedia('image')}>
                        <Camera size={14} className="mr-1.5" /> Add Photo
                      </Button>
                      <Button type="button" variant="outline" className="font-bold text-xs" onClick={() => handleUploadServiceMedia('video')}>
                        <Video size={14} className="mr-1.5" /> Add Video
                      </Button>
                    </div>
                  )}
                </div>

                <Button onClick={handleAddService} disabled={busy || !newService.title.trim()} variant="accent" className="w-full font-bold">
                  Publish service
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Published services</h2>
              <div className="grid gap-3">
                {services.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-3 p-4 bg-card border border-border rounded-xl shadow-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      {s.media_url && (
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border bg-secondary">
                          {/\.(mp4|webm|mov|m4v)(?:\?|#|$)/i.test(s.media_url) ? (
                            <video src={s.media_url} muted className="h-full w-full object-cover" />
                          ) : (
                            <img src={s.media_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-foreground">{s.title}</h3>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{s.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => handleDelete("services", s.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                       <div className="flex flex-col sm:flex-row gap-3">
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
                 <div key={t.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-card border rounded-lg">
                   <div className="flex min-w-0 gap-3 sm:gap-4 items-center">
                    {t.image_url && (
                       <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                         {t.image_url.includes('.mp4') ? <div className="w-full h-full bg-secondary flex items-center justify-center"><Video size={20} /></div> : <img src={t.image_url} className="w-full h-full object-cover" />}
                       </div>
                    )}
                     <div className="min-w-0">
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
    </div>
  );
};

export default AdminContentPage;
