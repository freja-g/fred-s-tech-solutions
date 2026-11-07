import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, AppNotification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, MessageSquare, Briefcase, CreditCard, Info, CheckCheck, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const formatTimeAgo = (isoString: string) => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
};

export const NotificationDrawer = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const nav = useNavigate();

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const handleItemClick = (item: AppNotification) => {
    markAsRead(item.id);
    setOpen(false);
    if (item.link) {
      nav(item.link);
    }
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "job":
        return <Briefcase size={16} className="text-accent" />;
      case "message":
        return <MessageSquare size={16} className="text-sky-500" />;
      case "payment":
        return <CreditCard size={16} className="text-emerald-500" />;
      default:
        return <Info size={16} className="text-amber-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-secondary/70 transition-colors text-foreground focus:outline-none"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-extrabold flex items-center justify-center leading-none shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-accent" />
            <DialogTitle className="text-base font-extrabold text-foreground">
              Notifications {unreadCount > 0 && `(${unreadCount} new)`}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-bold text-accent"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck size={14} className="mr-1" /> Read all
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-bold text-muted-foreground hover:text-destructive"
                onClick={clearAll}
                title="Clear all"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Filter Tabs */}
        <div className="flex border-b border-border bg-card/50 px-4 py-2 text-xs font-bold gap-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn("px-2.5 py-1 rounded-lg transition-colors", filter === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn("px-2.5 py-1 rounded-lg transition-colors", filter === "unread" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List Body */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-border p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-bold text-sm text-foreground">No notifications</p>
              <p>You're all caught up!</p>
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full p-3 rounded-xl text-left flex items-start gap-3 transition-colors hover:bg-secondary/60 relative group",
                  !item.read ? "bg-accent/10 dark:bg-accent/15" : "bg-card"
                )}
              >
                <div className="p-2 rounded-xl bg-background border border-border shrink-0 mt-0.5 shadow-sm">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 pr-2 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-foreground truncate">{item.title}</h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatTimeAgo(item.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{item.body}</p>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" title="Unread" />
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
