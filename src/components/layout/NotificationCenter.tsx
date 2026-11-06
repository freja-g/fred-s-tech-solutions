import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, CreditCard, MessageCircle, ClipboardList } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppNotifications, type AppNotification } from "@/hooks/useAppNotifications";

const NotificationIcon = ({ kind }: { kind: AppNotification["kind"] }) => {
  if (kind === "message") return <MessageCircle className="h-4 w-4" />;
  if (kind === "payment") return <CreditCard className="h-4 w-4" />;
  return <ClipboardList className="h-4 w-4" />;
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { items, unreadCount, markRead, markAllRead } = useAppNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} title="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-none text-accent-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-sm p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-semibold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[min(60vh,28rem)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Bell className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">You’re all caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">New messages and service updates will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3 text-left"
                    onClick={() => {
                      markRead(item.id);
                      navigate(item.link);
                    }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                      <NotificationIcon kind={item.kind} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">{item.title}</span>
                        {!item.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                      </span>
                      <span className="mt-0.5 block line-clamp-2 text-xs font-normal text-muted-foreground">{item.body}</span>
                      <span className="mt-1 block text-[10px] font-normal text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">Phone alerts are not connected yet.</p>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;