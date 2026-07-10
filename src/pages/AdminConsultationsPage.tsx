
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase as _sb } from "@/integrations/supabase/client";
const supabase: any = _sb;
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Clock, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminConsultationsPage = () => {
  const { user, isAdmin, isTechnician } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<any[]>([]);

  const isStaff = isAdmin || isTechnician;

  const fetchConsultations = async () => {
    const { data, error } = await supabase
      .from("consultations")
      .select("*, profiles:customer_id(display_name, email)")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setConsultations(data || []);
  };

  useEffect(() => {
    if (isStaff) fetchConsultations();
  }, [isStaff]);

  const handleUpdateStatus = async (id: string, status: string, extra: Record<string, any> = {}) => {
    const { error } = await supabase
      .from("consultations")
      .update({ status, ...extra })
      .eq("id", id);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      const label =
        status === "accepted" ? "Accepted — you are assigned to this request." :
        status === "in_progress" ? "Marked as in progress." :
        status === "resolved" ? "Marked as resolved. 🎉" :
        status === "completed" ? "Marked as completed." :
        "Updated.";
      toast({ title: "Consultation updated", description: label });
      fetchConsultations();
    }
  };

  const handleAccept = (id: string) =>
    handleUpdateStatus(id, "accepted", { technician_id: user?.id });

  if (!isStaff) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16 container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Consultation Requests</h1>

        <div className="grid gap-6">
          {consultations.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No consultation requests found.</p>
          )}

          {consultations.map(c => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{c.subject}</CardTitle>
                    <Badge variant={c.status === 'pending' ? 'outline' : 'default'}>
                      {c.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    From: {c.profiles?.display_name || "Unknown"} ({c.profiles?.email})
                  </CardDescription>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <Clock size={12} className="inline mr-1" />
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{c.description}</p>

                {c.attachment_urls && c.attachment_urls.length > 0 && (
                  <div className="flex gap-2">
                    {c.attachment_urls.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded border overflow-hidden bg-secondary hover:opacity-80 transition-opacity">
                        {url.includes('.mp4') ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/10">
                            <ImageIcon size={20} className="text-muted-foreground" />
                          </div>
                        ) : (
                          <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                        )}
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {c.status === 'pending' && (
                    <Button onClick={() => handleAccept(c.id)} variant="accent" className="flex-1 min-w-[180px]">
                      Accept & Start Working
                    </Button>
                  )}

                  {(c.status === 'accepted' || c.status === 'in_progress') && (c.technician_id === user?.id || isAdmin) && (
                    <>
                      {c.status === 'accepted' && (
                        <Button variant="outline" className="flex-1 min-w-[160px]" onClick={() => handleUpdateStatus(c.id, 'in_progress')}>
                          Mark In Progress
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1 min-w-[160px]" onClick={() => nav(`/admin/messages?customer=${c.customer_id}`)}>
                        Message Client
                      </Button>
                      <Button variant="accent" className="flex-1 min-w-[160px]" onClick={() => handleUpdateStatus(c.id, 'resolved', { resolved_at: new Date().toISOString() })}>
                        <CheckCircle className="mr-2" size={16} /> Mark Resolved
                      </Button>
                    </>
                  )}

                  {c.status === 'resolved' && (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground gap-2 py-2">
                      <CheckCircle size={16} className="text-accent" /> Resolved
                      {c.resolved_at && ` on ${new Date(c.resolved_at).toLocaleDateString()}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminConsultationsPage;
