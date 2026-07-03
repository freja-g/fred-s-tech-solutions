
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle, Star, Settings, FileText, User } from "lucide-react";

const StaffDashboard = () => {
  const navigate = useNavigate();

  const links = [
    { label: "Manage Messages", path: "/admin/messages", icon: MessageCircle },
    { label: "Moderate Reviews", path: "/admin/reviews", icon: Star },
    { label: "Manage Content", path: "/admin/content", icon: Settings },
    { label: "Consultations", path: "/admin/consultations", icon: FileText },
    { label: "Edit My Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Shield className="text-accent h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome to the Wiga Staff Portal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map((link) => (
          <Button
            key={link.path}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all group"
            onClick={() => navigate(link.path)}
          >
            <link.icon className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
            <span>{link.label}</span>
          </Button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                <p className="text-2xl font-bold text-accent">--</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending Messages</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                <p className="text-2xl font-bold text-accent">--</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">New Reviews</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                <p className="text-2xl font-bold text-accent">--</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Consultations</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                <p className="text-2xl font-bold text-accent">--</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Users</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
