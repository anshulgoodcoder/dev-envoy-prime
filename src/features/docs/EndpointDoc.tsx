import type { OpenApiOperation, OpenApiParameter, ResolvedEndpoint } from "@/apis/types";
import { MethodBadge } from "@/components/MethodBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { CodeBlock } from "@/components/CodeBlock";

export function EndpointDoc({
  endpoint,
  baseUrl,
}: {
  endpoint: ResolvedEndpoint;
  baseUrl: string;
}) {
  const { operation, method, path } = endpoint;

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-start gap-3 flex-wrap">
          <MethodBadge method={method} className="mt-1" />
          <code className="font-mono text-base break-all">{path}</code>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{operation.summary ?? "Endpoint"}</h2>
        {operation.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{operation.description}</p>
        )}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Base URL:</span>{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">{baseUrl}</code>
        </div>
      </header>

      <ParametersTable params={operation.parameters} />
      <RequestBody operation={operation} />
      <Responses operation={operation} />
    </article>
  );
}

function ParametersTable({ params }: { params?: OpenApiParameter[] }) {
  if (!params?.length) return null;
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">Parameters</h3>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium">In</th>
              <th className="text-left px-3 py-2 font-medium">Type</th>
              <th className="text-left px-3 py-2 font-medium">Required</th>
              <th className="text-left px-3 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {params.map((p) => (
              <tr key={`${p.in}-${p.name}`} className="hover:bg-muted/20">
                <td className="px-3 py-2 font-mono text-xs">{p.name}</td>
                <td className="px-3 py-2 text-xs"><span className="rounded bg-muted px-1.5 py-0.5">{p.in}</span></td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{p.schema?.type ?? "string"}</td>
                <td className="px-3 py-2 text-xs">{p.required ? <span className="text-destructive">yes</span> : <span className="text-muted-foreground">no</span>}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{p.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RequestBody({ operation }: { operation: OpenApiOperation }) {
  const body = operation.requestBody;
  if (!body?.content) return null;
  const json = body.content["application/json"];
  if (!json) return null;
  const example = json.example ?? json.schema;
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">
        Request body
        {body.required && <span className="ml-2 text-xs text-destructive">required</span>}
      </h3>
      {body.description && <p className="mb-2 text-sm text-muted-foreground">{body.description}</p>}
      {example !== undefined && (
        <CodeBlock language="json" code={JSON.stringify(example, null, 2)} />
      )}
    </section>
  );
}

function Responses({ operation }: { operation: OpenApiOperation }) {
  const responses = operation.responses;
  if (!responses) return null;
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">Responses</h3>
      <div className="space-y-3">
        {Object.entries(responses).map(([code, r]) => {
          const status = Number(code);
          const example = r.content?.["application/json"]?.example;
          return (
            <div key={code} className="rounded-lg border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30">
                <StatusBadge status={status} />
                <span className="text-sm">{r.description ?? "—"}</span>
              </div>
              {example !== undefined && (
                <div className="border-t">
                  <CodeBlock language="json" code={JSON.stringify(example, null, 2)} maxHeight="280px" className="rounded-none border-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
