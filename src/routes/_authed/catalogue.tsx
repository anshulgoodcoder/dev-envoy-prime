import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { apiRegistry, listEndpoints, groupByTag } from "@/apis/api-registry";
import { MethodBadge } from "@/components/MethodBadge";
import { HealthDot } from "@/components/StatusBadge";

export const Route = createFileRoute("/_authed/catalogue")({ component: CataloguePage });

function CataloguePage() {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Registry</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">API Catalogue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every API plugged into this portal. Adding a new one is just an{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">openapi.json</code> and a registry entry.
        </p>
      </div>

      <div className="space-y-6">
        {apiRegistry.map((api) => {
          const endpoints = listEndpoints(api);
          const groups = groupByTag(endpoints);
          return (
            <div key={api.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4">
                <HealthDot status={api.status ?? "operational"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{api.name}</h2>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{api.version}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground truncate">
                    <code>{api.baseUrl}</code>
                  </div>
                </div>
                <Link
                  to="/docs/$apiId"
                  params={{ apiId: api.id }}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Open docs <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground">{api.description}</p>
                {Object.entries(groups).map(([tag, eps]) => (
                  <div key={tag}>
                    <div className="mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      {tag}
                    </div>
                    <div className="grid gap-1.5">
                      {eps.map((e) => (
                        <Link
                          key={`${e.method}${e.path}`}
                          to="/docs/$apiId"
                          params={{ apiId: api.id }}
                          search={{ endpoint: `${e.method} ${e.path}` }}
                          className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/40 transition-colors"
                        >
                          <MethodBadge method={e.method} />
                          <code className="text-xs font-mono">{e.path}</code>
                          <span className="text-xs text-muted-foreground truncate">{e.operation.summary}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                {api.sdks?.length ? (
                  <div className="pt-2 border-t flex flex-wrap gap-2 text-xs">
                    <span className="text-muted-foreground">SDKs:</span>
                    {api.sdks.map((s) => (
                      <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        {s.language} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
