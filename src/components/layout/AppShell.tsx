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
          <div className="flex items-center gap-2 border-b bg-warning/10 px-4 py-2 text-xs text-warning-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
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
