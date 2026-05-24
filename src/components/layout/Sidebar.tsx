import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  BookOpen,
  Boxes,
  ChevronsLeft,
  GitBranch,
  KeyRound,
  Settings,
  TerminalSquare,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: Boxes },
  { to: "/catalogue", label: "API Catalogue", icon: Boxes },
  { to: "/docs", label: "Documentation", icon: BookOpen },
  { to: "/sandbox", label: "Sandbox", icon: TerminalSquare },
  { to: "/keys", label: "API Keys", icon: KeyRound },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/status", label: "Status", icon: Activity },
  { to: "/changelog", label: "Changelog", icon: GitBranch },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out",
        collapsed ? "w-[68px]" : "w-[244px]",
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md gradient-brand text-white shadow-sm shrink-0">
          <Zap className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-semibold">Developer Portal</div>
            <div className="text-[10px] text-muted-foreground">v1.0 · multi-API</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={cn(
                "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active &&
                  "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-inset ring-primary/20",
                collapsed && "justify-center",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed((c) => !c)}
          className="w-full justify-center text-muted-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
    </aside>
  );
}
