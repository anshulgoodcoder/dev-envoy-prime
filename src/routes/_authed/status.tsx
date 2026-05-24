import { createFileRoute } from "@tanstack/react-router";
import { apiRegistry } from "@/apis/api-registry";
import { Card, CardContent } from "@/components/ui/card";
import { HealthDot, type HealthStatus } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/status")({ component: StatusPage });

const incidents = [
  { date: "2025-11-02", title: "Payments API elevated latency", resolved: true, notes: "Database failover took ~12 minutes. Connection pooler updated." },
  { date: "2025-10-15", title: "Brief PokéAPI mirror outage", resolved: true, notes: "Upstream rate-limit; resolved by switching cache layer." },
  { date: "2025-09-04", title: "Scheduled maintenance", resolved: true, notes: "No user-facing impact." },
];

function uptimeBars(days = 90) {
  let seed = 99;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: days }, () => {
    const r = rnd();
    return r > 0.97 ? "outage" : r > 0.93 ? "degraded" : "operational";
  });
}

function StatusPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">System</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Status</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live health of every API in the registry.</p>
      </div>

      <div className="space-y-4">
        {apiRegistry.map((api) => {
          const bars = uptimeBars(90);
          const operational = bars.filter((b) => b === "operational").length;
          const uptimePct = ((operational / bars.length) * 100).toFixed(2);
          return (
            <Card key={api.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <HealthDot status={api.status ?? "operational"} />
                  <div>
                    <div className="font-semibold">{api.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{api.status ?? "operational"}</div>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">90-day uptime: <span className="font-semibold text-foreground">{uptimePct}%</span></div>
                </div>
                <div className="flex gap-[2px]">
                  {bars.map((b, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-7 flex-1 rounded-sm",
                        b === "operational" && "bg-success/70",
                        b === "degraded" && "bg-warning/70",
                        b === "outage" && "bg-destructive/70",
                      )}
                      title={`Day ${i + 1}: ${b}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>90 days ago</span>
                  <span>Today</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="text-sm font-semibold mb-4">Recent incidents</div>
          <div className="space-y-4">
            {incidents.map((i) => (
              <div key={i.title} className="relative pl-6 border-l-2 border-border">
                <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <div className="text-xs text-muted-foreground">{i.date}</div>
                <div className="text-sm font-medium">{i.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{i.notes}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { HealthStatus };
