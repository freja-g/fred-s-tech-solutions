
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Clock, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminConsultationsPage = () => {
  const { user, isAdmin, isTechnician } = useAuth();
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

  const handleAccept = async (id: string) => {
    const { error } = await supabase
      .from("consultations")
      .update({ status: "accepted", technician_id: user?.id })
      .eq("id", id);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Consultation Accepted", description: "You are now assigned to this request." });
      fetchConsultations();
    }
  };

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
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded border overflow-hidden bg-secondary hover:opacity-80 transition-opacity">
                        <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {c.status === 'pending' && (
                  <Button onClick={() => handleAccept(c.id)} className="w-full" variant="accent">
                    Accept Consultation
                  </Button>
                )}

                {c.status === 'accepted' && c.technician_id === user?.id && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => toast({ title: "Feature coming soon", description: "Full chat integration for accepted consultations is in progress." })}>
                      Message Client
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={async () => {
                      await supabase.from("consultations").update({ status: "completed" }).eq("id", c.id);
                      fetchConsultations();
                    }}>
                      <CheckCircle className="mr-2" size={16} /> Mark Completed
                    </Button>
                  </div>
                )}
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
