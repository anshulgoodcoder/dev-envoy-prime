import { useMemo, useState } from "react";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { z } from "zod";

import { getApi, groupByTag, listEndpoints, endpointKey } from "@/apis/api-registry";
import { MethodBadge } from "@/components/MethodBadge";
import { HealthDot } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { EndpointDoc } from "@/features/docs/EndpointDoc";
import { Sandbox } from "@/features/sandbox/Sandbox";
import { cn } from "@/lib/utils";
import type { ResolvedEndpoint } from "@/apis/types";

const searchSchema = z.object({ endpoint: z.string().optional() });

export const Route = createFileRoute("/_authed/docs/$apiId")({
  validateSearch: searchSchema,
  loader: ({ params }) => {
    const api = getApi(params.apiId);
    if (!api) throw notFound();
    return { api };
  },
  component: DocsPage,
});

function DocsPage() {
  const { api } = Route.useLoaderData();
  const search = Route.useSearch();
  const nav = useNavigate();
  const endpoints = useMemo(() => listEndpoints(api), [api]);
  const groups = useMemo(() => groupByTag(endpoints), [endpoints]);
  const [filter, setFilter] = useState("");

  const selected: ResolvedEndpoint =
    endpoints.find((e) => endpointKey(e) === search.endpoint) ?? endpoints[0];

  const setSelected = (e: ResolvedEndpoint) => {
    nav({
      to: "/docs/$apiId",
      params: { apiId: api.id },
      search: { endpoint: endpointKey(e) },
      replace: true,
    });
  };

  const filtered = (eps: ResolvedEndpoint[]) =>
    filter
      ? eps.filter(
          (e) =>
            e.path.toLowerCase().includes(filter.toLowerCase()) ||
            (e.operation.summary ?? "").toLowerCase().includes(filter.toLowerCase()),
        )
      : eps;

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,440px)] min-w-0">
      {/* Endpoints sidebar */}
      <aside className="hidden lg:flex flex-col border-r bg-sidebar/40 min-w-0">
        <div className="p-3 border-b space-y-3">
          <div className="flex items-center gap-2">
            <HealthDot status={api.status ?? "operational"} />
            <span className="font-semibold text-sm truncate">{api.name}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{api.version}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search endpoints"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {Object.entries(groups).map(([tag, eps]) => {
            const fEps = filtered(eps);
            if (!fEps.length) return null;
            return (
              <div key={tag}>
                <div className="px-2 mb-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {tag}
                </div>
                <div className="space-y-0.5">
                  {fEps.map((e) => {
                    const active = endpointKey(e) === endpointKey(selected);
                    return (
                      <button
                        key={endpointKey(e)}
                        onClick={() => setSelected(e)}
                        className={cn(
                          "group w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs hover:bg-accent/60 transition-colors",
                          active && "bg-accent ring-1 ring-inset ring-primary/30",
                        )}
                      >
                        <MethodBadge method={e.method} />
                        <span className="font-mono truncate">{e.path}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Docs */}
      <section className="overflow-y-auto p-6 lg:p-8 min-w-0">
        {api.docsMarkdown && (
          <div className="mb-8 rounded-xl border bg-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Getting started</div>
            <Markdown source={api.docsMarkdown} />
          </div>
        )}
        {selected ? (
          <EndpointDoc endpoint={selected} baseUrl={api.baseUrl} />
        ) : (
          <div className="text-sm text-muted-foreground">No endpoints in this API.</div>
        )}
      </section>

      {/* Sandbox */}
      <aside className="hidden lg:flex flex-col border-l bg-card min-w-0">
        {selected && <Sandbox key={endpointKey(selected)} endpoint={selected} baseUrl={api.baseUrl} />}
      </aside>
    </div>
  );
}

// Tiny markdown — handles headings, paragraphs, inline code, fenced code.
function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n```/);
  return (
    <div className="prose-sm max-w-none text-sm leading-relaxed space-y-3">
      {blocks.map((block, i) => {
        if (i % 2 === 1) {
          const [lang, ...rest] = block.split("\n");
          return (
            <pre key={i} className="rounded-md bg-muted/60 border p-3 overflow-x-auto text-xs font-mono">
              <code data-lang={lang}>{rest.join("\n")}</code>
            </pre>
          );
        }
        return (
          <div key={i} className="space-y-2">
            {block.split(/\n\n+/).map((para, j) => {
              if (para.startsWith("# ")) return <h2 key={j} className="text-lg font-semibold">{para.slice(2)}</h2>;
              if (para.startsWith("## ")) return <h3 key={j} className="text-base font-semibold mt-3">{para.slice(3)}</h3>;
              if (para.startsWith("- "))
                return (
                  <ul key={j} className="list-disc pl-5 space-y-1">
                    {para.split("\n").map((l, k) => (
                      <li key={k} dangerouslySetInnerHTML={{ __html: inline(l.replace(/^- /, "")) }} />
                    ))}
                  </ul>
                );
              return <p key={j} dangerouslySetInnerHTML={{ __html: inline(para) }} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

function inline(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">$1</code>');
}
