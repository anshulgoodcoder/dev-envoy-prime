import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status?: number | null; className?: string }) {
  if (status == null) return null;
  const cls =
    status < 300
      ? "bg-success/10 text-success ring-success/30"
      : status < 400
      ? "bg-info/10 text-info ring-info/30"
      : status < 500
      ? "bg-warning/10 text-warning ring-warning/30"
      : "bg-destructive/10 text-destructive ring-destructive/30";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset font-mono",
        cls,
        className,
      )}
    >
      {status}
    </span>
  );
}

export type HealthStatus = "operational" | "degraded" | "outage";

export function HealthDot({ status }: { status: HealthStatus }) {
  const map: Record<HealthStatus, string> = {
    operational: "bg-success",
    degraded: "bg-warning",
    outage: "bg-destructive",
  };
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className={cn("absolute inset-0 rounded-full animate-ping opacity-60", map[status])} />
      <span className={cn("relative rounded-full h-2.5 w-2.5", map[status])} />
    </span>
  );
}
