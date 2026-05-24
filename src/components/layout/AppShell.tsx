import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { apiRegistry } from "@/apis/api-registry";
import { AlertTriangle } from "lucide-react";

export function AppShell() {
  const degraded = apiRegistry.filter((a) => a.status === "degraded" || a.status === "outage");
  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        {degraded.length > 0 && (
          <div className="flex items-center gap-2 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm text-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
            <span>
              <strong className="font-semibold">{degraded.map((d) => d.name).join(", ")}</strong>{" "}
              {degraded.length === 1 ? "is" : "are"} experiencing degraded performance.
            </span>
          </div>
        )}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
