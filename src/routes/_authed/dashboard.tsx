import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  KeyRound,
  TerminalSquare,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { apiRegistry, listEndpoints } from "@/apis/api-registry";
import { useAuth } from "@/lib/auth";
import { MethodBadge } from "@/components/MethodBadge";
import { HealthDot } from "@/components/StatusBadge";

export const Route = createFileRoute("/_authed/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { user } = useAuth();
  const totalEndpoints = apiRegistry.reduce((n, a) => n + listEndpoints(a).length, 0);

  const stats = [
    { label: "Registered APIs", value: apiRegistry.length, icon: BookOpen },
    { label: "Total Endpoints", value: totalEndpoints, icon: TerminalSquare },
    { label: "Calls (30d)", value: "12,840", icon: TrendingUp },
    { label: "Uptime", value: "99.94%", icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Overview</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse APIs, try endpoints in the sandbox, and manage your keys.
        </p>
      </motion.div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Your APIs</h2>
          <Link to="/catalogue" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
            View catalogue <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {apiRegistry.map((api) => {
            const endpoints = listEndpoints(api);
            return (
              <Link
                key={api.id}
                to="/docs/$apiId"
                params={{ apiId: api.id }}
                className="group rounded-xl border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <HealthDot status={api.status ?? "operational"} />
                      <h3 className="font-semibold">{api.name}</h3>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{api.version}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{api.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {endpoints.slice(0, 5).map((e) => (
                    <MethodBadge key={`${e.method}${e.path}`} method={e.method} />
                  ))}
                  {endpoints.length > 5 && (
                    <span className="text-xs text-muted-foreground self-center">
                      +{endpoints.length - 5} more
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/sandbox" className="rounded-xl border bg-card p-5 hover:border-primary/40 transition-colors">
          <TerminalSquare className="h-5 w-5 text-primary" />
          <div className="mt-3 font-semibold">Open Sandbox</div>
          <div className="text-sm text-muted-foreground">Try any endpoint live with autogen code snippets.</div>
        </Link>
        <Link to="/keys" className="rounded-xl border bg-card p-5 hover:border-primary/40 transition-colors">
          <KeyRound className="h-5 w-5 text-secondary" />
          <div className="mt-3 font-semibold">Manage API Keys</div>
          <div className="text-sm text-muted-foreground">Create, scope, and revoke keys per environment.</div>
        </Link>
        <Link to="/analytics" className="rounded-xl border bg-card p-5 hover:border-primary/40 transition-colors">
          <TrendingUp className="h-5 w-5 text-accent" />
          <div className="mt-3 font-semibold">View Analytics</div>
          <div className="text-sm text-muted-foreground">Track latency, error rate, and request volume.</div>
        </Link>
      </section>
    </div>
  );
}
