import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GitCommit } from "lucide-react";
import { apiRegistry } from "@/apis/api-registry";
import type { ChangelogEntry } from "@/apis/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/changelog")({ component: ChangelogPage });

const TYPE_CLASS: Record<ChangelogEntry["type"], string> = {
  breaking: "bg-destructive/10 text-destructive ring-destructive/30",
  feature: "bg-success/10 text-success ring-success/30",
  fix: "bg-info/10 text-info ring-info/30",
};

function ChangelogPage() {
  const [apiFilter, setApiFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const entries = useMemo(() => {
    return apiRegistry
      .flatMap((api) => (api.changelog ?? []).map((c) => ({ ...c, apiId: api.id, apiName: api.name })))
      .filter((e) => (apiFilter === "all" ? true : e.apiId === apiFilter))
      .filter((e) => (typeFilter === "all" ? true : e.type === typeFilter))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [apiFilter, typeFilter]);

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">What's new</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-1 text-sm text-muted-foreground">Releases across all APIs in the portal.</p>
      </div>

      <div className="flex gap-2">
        <Select value={apiFilter} onValueChange={setApiFilter}>
          <SelectTrigger className="w-[180px] h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All APIs</SelectItem>
            {apiRegistry.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="breaking">Breaking</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="fix">Fix</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {entries.map((e, i) => (
          <div key={i} className="relative pl-8">
            <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GitCommit className="h-3.5 w-3.5" />
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{e.apiName}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono">v{e.version}</span>
              <span>·</span>
              <span>{e.date}</span>
              <span className={cn("ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset", TYPE_CLASS[e.type])}>
                {e.type}
              </span>
            </div>
            <div className="mt-1 font-semibold">{e.title}</div>
            {e.notes && <p className="mt-1 text-sm text-muted-foreground">{e.notes}</p>}
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-sm text-muted-foreground">No releases match these filters.</div>
        )}
      </div>
    </div>
  );
}
