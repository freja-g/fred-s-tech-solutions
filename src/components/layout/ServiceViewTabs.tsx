import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const ServiceViewTabs = () => (
  <div className="container max-w-4xl py-4">
    <div className="grid grid-cols-2 rounded-xl bg-secondary p-1">
      <NavLink
        to="/services"
        className={({ isActive }) => cn("rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Services
      </NavLink>
      <NavLink
        to="/get-smart"
        className={({ isActive }) => cn("rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
      >
        Get Smart
      </NavLink>
    </div>
  </div>
);

export default ServiceViewTabs;