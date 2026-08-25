export const ZONES = [
  "Nairobi CBD",
  "Westlands",
  "Kilimani",
  "Karen",
  "Lang'ata",
  "Embakasi",
  "Kasarani",
  "Ruaka",
  "Thika Road",
  "Ngong Road",
  "Kiambu",
  "Machakos",
  "Remote / Online",
];

export const SPECIALTIES = [
  "Laptop & PC repair",
  "Networking & WiFi",
  "CCTV & security",
  "Printers",
  "POS systems",
  "Data recovery",
  "Software & OS",
  "Cloud & backups",
  "Web & hosting",
  "Phone repair",
];

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const JOB_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
  resolved: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n || 0);

/** Average of numbers, 0 when empty. */
export const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

/** Human readable duration from milliseconds. */
export const humanDuration = (ms: number) => {
  if (!ms || ms < 0) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = mins / 60;
  if (hrs < 24) return `${hrs.toFixed(1)} hrs`;
  return `${(hrs / 24).toFixed(1)} days`;
};
