import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, ShieldCheck } from "lucide-react";

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
  const [latestSubject, setLatestSubject] = useState<string>("GiCOFix Support");
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

    const cacheKey = `cached_messages_${user.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setMessages(JSON.parse(cached)); } catch {}
    }

    // Fetch latest consultation subject for chat header context matching PDF Page 6
    supabase
      .from("consultations")
      .select("subject")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.subject) setLatestSubject(`Re: ${data.subject}`);
      });

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
      .then(({ data, error }) => {
        if (data && !error) {
          setMessages(data as Msg[]);
          try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
          markRead();
        }
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
    <div className="fixed inset-0 z-20 flex flex-col bg-background/30 overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0 pt-[env(safe-area-inset-top,0px)]">
      <Header />
      <main className="flex-1 min-h-0 flex flex-col w-full h-full bg-card/60 pt-20 sm:pt-24">
        {/* Chat Header matching Page 6 PDF */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center shrink-0 text-lg">
            G
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-base leading-tight flex items-center gap-1.5 truncate">
              GiCOFix Team <ShieldCheck size={16} className="text-accent fill-accent/20 shrink-0" />
            </h1>
            <p className="text-xs text-muted-foreground truncate">{latestSubject}</p>
          </div>
        </div>

        {/* Message Feed Area - Full Screen Fill */}
        <div className="flex-1 min-h-0 overflow-y-auto touch-pan-y p-3 sm:p-4 md:p-6 space-y-3 overscroll-contain bg-background/50">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground py-12">
              No messages yet. Start the conversation below.
            </div>
          )}
          {messages.map((m) => {
            const isUser = m.sender_role === "customer";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[70%] md:max-w-[55%] break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isUser
                      ? "bg-accent text-accent-foreground rounded-br-none"
                      : "bg-card text-foreground rounded-bl-none border border-border"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="text-[10px] opacity-70 mt-1 text-right">
                    {isUser ? (
                      m.read_at ? (
                        `Seen ${new Date(m.read_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      ) : (
                        new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      )
                    ) : (
                      new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    )}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Full-width Chat Input Bar */}
        <div className="border-t border-border p-3 sm:p-4 flex gap-2 shrink-0 bg-card">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message..."
            maxLength={4000}
            className="rounded-full px-4 h-11 text-sm bg-background border-border"
          />
          <Button onClick={send} disabled={sending || !text.trim()} variant="accent" className="rounded-full px-5 h-11 shrink-0">
            <Send size={18} />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
