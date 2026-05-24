import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRegistry, listEndpoints } from "@/apis/api-registry";
import { MethodBadge } from "@/components/MethodBadge";

export const Route = createFileRoute("/_authed/analytics")({ component: AnalyticsPage });

function genSeries(days: number) {
  const out: { date: string; calls: number; errors: number; latency: number }[] = [];
  const now = Date.now();
  let seed = 42;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400_000);
    const base = 800 + rnd() * 600;
    out.push({
      date: d.toISOString().slice(5, 10),
      calls: Math.round(base),
      errors: Math.round(base * (0.01 + rnd() * 0.04)),
      latency: Math.round(80 + rnd() * 140),
    });
  }
  return out;
}

function AnalyticsPage() {
  const [range, setRange] = useState<"7" | "30">("30");
  const data = useMemo(() => genSeries(Number(range)), [range]);
  const totals = useMemo(() => {
    const calls = data.reduce((n, d) => n + d.calls, 0);
    const errors = data.reduce((n, d) => n + d.errors, 0);
    const avgLat = Math.round(data.reduce((n, d) => n + d.latency, 0) / data.length);
    return { calls, errors, avgLat, errorRate: ((errors / calls) * 100).toFixed(2), success: (100 - (errors / calls) * 100).toFixed(2) };
  }, [data]);

  const perEndpoint = useMemo(() => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    return apiRegistry.flatMap((api) =>
      listEndpoints(api).map((e) => ({
        api: api.name,
        method: e.method,
        path: e.path,
        calls: Math.round(120 + rnd() * 3200),
        p95: Math.round(80 + rnd() * 220),
        errorRate: (rnd() * 4).toFixed(2),
      })),
    ).sort((a, b) => b.calls - a.calls);
  }, []);

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
  } as const;

  return (
    <div className="p-6 lg:p-8 max-w-7xl space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Insights</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Aggregate traffic across all registered APIs.</p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as "7" | "30")}>
          <TabsList>
            <TabsTrigger value="7">7 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Total calls" value={totals.calls.toLocaleString()} />
        <Stat label="Error rate" value={`${totals.errorRate}%`} tone="warning" />
        <Stat label="Avg latency" value={`${totals.avgLat} ms`} />
        <Stat label="Success" value={`${totals.success}%`} tone="success" />
      </div>

      <Card><CardContent className="p-5">
        <div className="text-sm font-semibold mb-3">Request volume</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="calls" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-5">
        <div className="text-sm font-semibold mb-3">Errors vs Latency</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="errors" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="latency" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0 overflow-hidden">
        <div className="p-5 pb-3 text-sm font-semibold">Per endpoint</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">API</th>
              <th className="text-left px-4 py-2 font-medium">Endpoint</th>
              <th className="text-right px-4 py-2 font-medium">Calls</th>
              <th className="text-right px-4 py-2 font-medium">p95</th>
              <th className="text-right px-4 py-2 font-medium">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {perEndpoint.slice(0, 12).map((r, i) => (
              <tr key={i} className="hover:bg-muted/20">
                <td className="px-4 py-2 text-xs">{r.api}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-2">
                    <MethodBadge method={r.method} />
                    <code className="font-mono text-xs">{r.path}</code>
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-mono text-xs">{r.calls.toLocaleString()}</td>
                <td className="px-4 py-2 text-right font-mono text-xs">{r.p95} ms</td>
                <td className="px-4 py-2 text-right font-mono text-xs">{r.errorRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <Card><CardContent className="p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight ${cls}`}>{value}</div>
    </CardContent></Card>
  );
}
