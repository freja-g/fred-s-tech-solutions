import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: "job" | "message" | "payment" | "system";
  link?: string;
  createdAt: string;
  read: boolean;
};

type NotificationsCtx = {
  notifications: AppNotification[];
  unreadCount: number;
  sendAppNotification: (item: { title: string; body: string; type: AppNotification["type"]; link?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
};

const Ctx = createContext<NotificationsCtx>({
  notifications: [],
  unreadCount: 0,
  sendAppNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
});

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const storageKey = `gicofix_notifications_${user?.id || "guest"}`;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load saved notifications
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications([
          {
            id: "welcome-1",
            title: "Welcome to GiCOFix!",
            body: "Your technical consulting companion is ready. Book consultations, chat with support, and pay securely.",
            type: "system",
            link: "/services",
            createdAt: new Date().toISOString(),
            read: false,
          },
        ]);
      }
    } catch {
      setNotifications([]);
    }
  }, [user?.id]);

  // Request browser / device notification permissions if supported
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const saveToStorage = (list: AppNotification[]) => {
    setNotifications(list);
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {}
  };

  const sendAppNotification = ({
    title,
    body,
    type,
    link,
  }: {
    title: string;
    body: string;
    type: AppNotification["type"];
    link?: string;
  }) => {
    const newItem: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      body,
      type,
      link,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const updated = [newItem, ...notifications];
    saveToStorage(updated);

    // 1. Vibrate device if supported
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 150]); } catch {}
    }

    // 2. In-app Sonner Toast Banner
    toast(title, {
      description: body,
      action: link
        ? {
            label: "View",
            onClick: () => {
              window.location.href = link;
            },
          }
        : undefined,
    });

    // 3. Browser Native System Notification Alert
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.png",
        });
      } catch {}
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveToStorage(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveToStorage(updated);
  };

  const clearAll = () => {
    saveToStorage([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Ctx.Provider
      value={{
        notifications,
        unreadCount,
        sendAppNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useNotifications = () => useContext(Ctx);
