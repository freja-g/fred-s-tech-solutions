import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

type Msg = {
  id: string;
  customer_id: string;
  sender_id: string;
  sender_role: "admin" | "customer";
  body: string;
  created_at: string;
};

type Conversation = {
  customer_id: string;
  display_name: string;
  email: string;
  last_message: string;
  last_at: string;
};

const AdminMessagesPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) nav("/auth");
    if (!loading && user && !isAdmin) nav("/messages");
  }, [user, loading, isAdmin, nav]);

  const loadConversations = async () => {
    const { data: msgs } = await supabase
      .from("messages")
      .select("customer_id, body, created_at")
      .order("created_at", { ascending: false });
    if (!msgs) return;
    const seen = new Map<string, { body: string; at: string }>();
    msgs.forEach((m: any) => {
      if (!seen.has(m.customer_id)) seen.set(m.customer_id, { body: m.body, at: m.created_at });
    });
    const ids = Array.from(seen.keys());
    if (ids.length === 0) { setConversations([]); return; }
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, email")
      .in("user_id", ids);
    const byId = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    setConversations(ids.map((id) => {
      const p = byId.get(id);
      const last = seen.get(id)!;
      return {
        customer_id: id,
        display_name: p?.display_name ?? "Customer",
        email: p?.email ?? "",
        last_message: last.body,
        last_at: last.at,
      };
    }));
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadConversations();
    const channel = supabase
      .channel("admin-msgs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Msg;
        if (m.sender_role === "customer") {
          toast({ title: "New customer message" });
          loadConversations();
        }
        if (activeId && m.customer_id === activeId) {
          setMessages((prev) => [...prev, m]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, activeId, toast]);

  useEffect(() => {
    if (!activeId) return;
    supabase
      .from("messages")
      .select("*")
      .eq("customer_id", activeId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as Msg[]) ?? []));
  }, [activeId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const reply = async () => {
    if (!user || !activeId || !text.trim()) return;
    const { error } = await supabase.from("messages").insert({
      customer_id: activeId,
      sender_id: user.id,
      sender_role: "admin",
      body: text.trim(),
    });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else setText("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12 container max-w-6xl">
        <h1 className="text-2xl font-semibold mb-6">Admin Inbox</h1>
        <div className="grid md:grid-cols-3 gap-4 h-[70vh]">
          <div className="bg-card border border-border rounded-xl overflow-y-auto">
            <p className="text-xs uppercase font-medium text-muted-foreground p-3 border-b border-border">
              Conversations ({conversations.length})
            </p>
            {conversations.length === 0 && (
              <p className="text-sm text-muted-foreground p-4">No customer messages yet.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.customer_id}
                onClick={() => setActiveId(c.customer_id)}
                className={`w-full text-left p-3 border-b border-border hover:bg-secondary/50 transition-colors ${
                  activeId === c.customer_id ? "bg-secondary" : ""
                }`}
              >
                <p className="font-medium text-sm">{c.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{c.last_message}</p>
              </button>
            ))}
          </div>
          <div className="md:col-span-2 bg-card border border-border rounded-xl flex flex-col">
            {!activeId ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Select a conversation
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                        m.sender_role === "admin"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <div className="border-t border-border p-3 flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); reply(); } }}
                    placeholder="Reply to customer..."
                    maxLength={4000}
                  />
                  <Button onClick={reply} variant="accent" disabled={!text.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminMessagesPage;
