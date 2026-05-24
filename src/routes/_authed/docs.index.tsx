import { createFileRoute, Link } from "@tanstack/react-router";
import { apiRegistry } from "@/apis/api-registry";
import { Boxes } from "lucide-react";

export const Route = createFileRoute("/_authed/docs/")({ component: DocsIndex });

function DocsIndex() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Documentation</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Pick an API</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose an API to view its endpoints and try them live.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {apiRegistry.map((api) => (
          <Link
            key={api.id}
            to="/docs/$apiId"
            params={{ apiId: api.id }}
            className="rounded-xl border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <Boxes className="h-5 w-5 text-primary" />
            <div className="mt-3 flex items-center gap-2">
              <span className="font-semibold">{api.name}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{api.version}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{api.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
