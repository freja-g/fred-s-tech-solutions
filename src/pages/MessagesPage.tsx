import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";

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
  sender_role: "admin" | "customer" | "technician";
  body: string;
  read_at: string | null;
  created_at: string;
};

const MessagesPage = () => {
  const { user, loading, isAdmin, isTechnician } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const isStaff = isAdmin || isTechnician;

  useEffect(() => {
    if (!loading && !user) nav("/auth");
    if (!loading && user && isStaff) nav("/admin/messages");
  }, [user, loading, isStaff, nav]);

  useEffect(() => {
    if (!user || isStaff) return;

    const markRead = () => {
      supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("customer_id", user.id)
        .neq("sender_role", "customer")
        .is("read_at", null)
        .then();
    };

    supabase
      .from("messages")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as Msg[]) ?? []);
        markRead();
      });

    const channel = supabase
      .channel(`messages-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `customer_id=eq.${user.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Msg]);
          if ((payload.new as Msg).sender_role !== "customer") {
            markRead();
            toast({ title: "New message from support" });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `customer_id=eq.${user.id}` },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => prev.map((p) => (p.id === m.id ? { ...p, read_at: m.read_at } : p)));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isStaff, toast]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!user || !text.trim() || text.length > 4000) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      customer_id: user.id,
      sender_id: user.id,
      sender_role: "customer",
      body: text.trim(),
    });
    setSending(false);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      setText("");
    }
  };

  if (loading) return null;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 min-h-0 flex flex-col md:pt-24 pt-4 pb-20 md:pb-6 container max-w-2xl w-full">
        <h1 className="text-2xl font-semibold mb-2">Chat with GiCOFix</h1>
        <p className="text-sm text-muted-foreground mb-4 hidden sm:block">
          Recent communications across all our channels. Reply here or reach us anywhere.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-accent/15 text-accent px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> In-App · Active
          </span>
          <a href="https://wa.me/254742123999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full hover:bg-secondary/70">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> WhatsApp
          </a>
          <a href="mailto:wigatechnologies@gmail.com" className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full hover:bg-secondary/70">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Email
          </a>
        </div>
        <div className="bg-card border border-border rounded-xl flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No messages yet. Start the conversation below.
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_role === "customer" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                    m.sender_role === "customer"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(m.created_at).toLocaleString()}
                    {m.sender_role === "customer" && (
                      <span className="ml-1.5">
                        · {m.read_at ? `Seen ${new Date(m.read_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Sent"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-border p-3 flex gap-2 shrink-0">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ block: "end", behavior: "smooth" }), 300)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type your message..."
              maxLength={4000}
            />
            <Button onClick={send} disabled={sending || !text.trim()} variant="accent">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
