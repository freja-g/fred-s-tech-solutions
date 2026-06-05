import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type MessageRow = {
  id: string;
  body: string;
  customer_id: string;
  sender_id: string;
  sender_role: "admin" | "customer" | "technician";
  read_at: string | null;
  created_at: string;
};

export const useUnreadMessages = () => {
  const { user, isAdmin, isTechnician } = useAuth();
  const location = useLocation();
  const [count, setCount] = useState(0);
  const locationRef = useRef(location.pathname);

  const isStaff = isAdmin || isTechnician;

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  const onChatRoute = (path: string) =>
    path.startsWith("/messages") || path.startsWith("/admin/messages");

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      const query = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);

      const { count: c } = isStaff
        ? await query.eq("sender_role", "customer")
        : await query.eq("customer_id", user.id).neq("sender_role", "customer");

      setCount(c ?? 0);
    };

    fetchCount();

    const channel = supabase
      .channel(`messages-notify-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as MessageRow;
          const relevant = isStaff
            ? m.sender_role === "customer"
            : m.customer_id === user.id && m.sender_role !== "customer";

          if (!relevant) return;

          fetchCount();

          if (!onChatRoute(locationRef.current)) {
            const who = isStaff
              ? "New customer message"
              : m.sender_role === "admin"
              ? "New message from support"
              : "New message from technician";
            toast(who, {
              description: m.body.length > 80 ? m.body.slice(0, 80) + "…" : m.body,
              action: {
                label: "Open",
                onClick: () => {
                  window.location.href = isStaff ? "/admin/messages" : "/messages";
                },
              },
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isStaff]);

  return count;
};
