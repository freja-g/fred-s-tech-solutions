import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppNotification = {
  id: string;
  kind: "message" | "consultation" | "payment";
  title: string;
  body: string;
  link: string;
  createdAt: string;
  read: boolean;
};

const MAX_NOTIFICATIONS = 50;

const getStorageKey = (userId: string) => `gicofix-notifications-${userId}`;

const readStoredNotifications = (userId: string): AppNotification[] => {
  try {
    const stored = window.localStorage.getItem(getStorageKey(userId));
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as AppNotification[]).slice(0, MAX_NOTIFICATIONS) : [];
  } catch {
    return [];
  }
};

export const useAppNotifications = () => {
  const { user, isAdmin, isTechnician } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loadedForUser, setLoadedForUser] = useState<string | null>(null);
  const pathRef = useRef(location.pathname);
  const isStaff = isAdmin || isTechnician;

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoadedForUser(null);
      return;
    }
    setItems(readStoredNotifications(user.id));
    setLoadedForUser(user.id);
  }, [user?.id]);

  const saveItems = useCallback((update: (current: AppNotification[]) => AppNotification[]) => {
    if (!user) return;
    setItems((current) => {
      const next = update(current).slice(0, MAX_NOTIFICATIONS);
      try {
        window.localStorage.setItem(getStorageKey(user.id), JSON.stringify(next));
      } catch {
        // Notifications remain available for this session if storage is unavailable.
      }
      return next;
    });
  }, [user]);

  const addNotification = useCallback((notification: Omit<AppNotification, "read">) => {
    if (!user) return;
    saveItems((current) => [
      { ...notification, read: false },
      ...current.filter((item) => item.id !== notification.id),
    ]);
    if (!pathRef.current.startsWith(notification.link)) {
      toast(notification.title, {
        description: notification.body,
        action: {
          label: "Open",
          onClick: () => { window.location.href = notification.link; },
        },
      });
    }
  }, [saveItems, user]);

  useEffect(() => {
    if (!user || loadedForUser !== user.id) return;

    const channelName = `app-notifications-${user.id}-${Math.random().toString(36).slice(2)}`;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const add = (id: string, kind: AppNotification["kind"], title: string, body: string, link: string) => {
      addNotification({ id, kind, title, body, link, createdAt: new Date().toISOString() });
    };

    const handleMessage = (message: Record<string, any>) => {
      const fromCustomer = message.sender_role === "customer";
      if (isStaff && fromCustomer) {
        add(`message-${message.id}`, "message", "New customer message", String(message.body || ""), "/admin/messages");
      } else if (!isStaff && message.customer_id === user.id && !fromCustomer && message.sender_id !== user.id) {
        add(`message-${message.id}`, "message", "New message from your team", String(message.body || ""), "/messages");
      }
    };

    try {
      channel = supabase
        .channel(channelName)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
          handleMessage(payload.new as Record<string, any>);
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "consultations" }, (payload) => {
          const consultation = payload.new as Record<string, any>;
          if (isStaff) {
            add(`consultation-${consultation.id}-new`, "consultation", "New consultation booking", String(consultation.subject || "A customer booked a consultation"), "/admin/consultations");
          }
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "consultations" }, (payload) => {
          const current = payload.new as Record<string, any>;
          const previous = payload.old as Record<string, any>;
          if (!isStaff && current.customer_id === user.id && current.status && current.status !== previous.status) {
            const status = String(current.status).replaceAll("_", " ");
            add(`consultation-${current.id}-${current.status}-${current.updated_at || Date.now()}`, "consultation", "Consultation updated", `${current.subject || "Your consultation"} is now ${status}.`, "/consultations");
          }
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, async (payload) => {
          const payment = payload.new as Record<string, any>;
          if (!payment || (payload.eventType === "UPDATE" && payment.status === (payload.old as Record<string, any>)?.status)) return;
          let customerId = payment.customer_id as string | undefined;
          if (!customerId && payment.consultation_id) {
            const { data } = await (supabase as any)
              .from("consultations")
              .select("customer_id, subject")
              .eq("id", payment.consultation_id)
              .maybeSingle();
            customerId = data?.customer_id;
          }
          const paymentStatus = String(payment.status || "updated").replaceAll("_", " ");
          if (isStaff && customerId) {
            add(`payment-${payment.id}-${payment.status}`, "payment", "Customer payment updated", `A customer payment is ${paymentStatus}.`, "/admin/consultations");
          } else if (!isStaff && customerId === user.id) {
            add(`payment-${payment.id}-${payment.status}`, "payment", "Payment updated", `Your payment is ${paymentStatus}.`, "/consultations");
          }
        })
        .subscribe();
    } catch (error) {
      console.warn("Could not subscribe to app notifications:", error);
    }

    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [addNotification, isStaff, loadedForUser, user]);

  const markRead = useCallback((id: string) => {
    saveItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  }, [saveItems]);

  const markAllRead = useCallback(() => {
    saveItems((current) => current.map((item) => ({ ...item, read: true })));
  }, [saveItems]);

  return { items, unreadCount: items.filter((item) => !item.read).length, markRead, markAllRead };
};