import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { apiRegistry, listEndpoints } from "@/apis/api-registry";
import { MethodBadge } from "@/components/MethodBadge";
import {
  Activity,
  BarChart3,
  BookOpen,
  Boxes,
  GitBranch,
  KeyRound,
  Settings,
  TerminalSquare,
} from "lucide-react";

const PAGES = [
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

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const nav = useNavigate();
  const go = (to: string) => {
    onOpenChange(false);
    nav({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search endpoints, docs, pages…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((p) => {
            const Icon = p.icon;
            return (
              <CommandItem key={p.to} value={`page ${p.label}`} onSelect={() => go(p.to)}>
                <Icon className="mr-2 h-4 w-4" />
                {p.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        {apiRegistry.map((api) => {
          const endpoints = listEndpoints(api);
          return (
            <div key={api.id}>
              <CommandSeparator />
              <CommandGroup heading={`${api.name} endpoints`}>
                {endpoints.map((e) => (
                  <CommandItem
                    key={`${api.id}-${e.method}-${e.path}`}
                    value={`${api.id} ${e.method} ${e.path} ${e.operation.summary ?? ""}`}
                    onSelect={() =>
                      go(`/docs/${api.id}?endpoint=${encodeURIComponent(e.method + " " + e.path)}`)
                    }
                  >
                    <MethodBadge method={e.method} className="mr-2" />
                    <span className="font-mono text-xs truncate">{e.path}</span>
                    {e.operation.summary && (
                      <span className="ml-2 text-xs text-muted-foreground truncate">
                        {e.operation.summary}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
