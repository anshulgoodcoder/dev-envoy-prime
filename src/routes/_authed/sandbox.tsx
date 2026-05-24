import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { apiRegistry, getApi, listEndpoints, endpointKey } from "@/apis/api-registry";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sandbox } from "@/features/sandbox/Sandbox";
import { MethodBadge } from "@/components/MethodBadge";

export const Route = createFileRoute("/_authed/sandbox")({ component: SandboxPage });

function SandboxPage() {
  const [apiId, setApiId] = useState(apiRegistry[0].id);
  const api = getApi(apiId)!;
  const endpoints = useMemo(() => listEndpoints(api), [api]);
  const [epKey, setEpKey] = useState(endpointKey(endpoints[0]));
  const endpoint = endpoints.find((e) => endpointKey(e) === epKey) ?? endpoints[0];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="border-b p-4 flex flex-wrap items-center gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Sandbox</div>
          <h1 className="text-lg font-semibold">Interactive API console</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={apiId}
            onValueChange={(v) => {
              setApiId(v);
              const first = listEndpoints(getApi(v)!)[0];
              setEpKey(endpointKey(first));
            }}
          >
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {apiRegistry.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name} <span className="text-muted-foreground ml-1">{a.version}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={epKey} onValueChange={setEpKey}>
            <SelectTrigger className="h-9 w-[340px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {endpoints.map((e) => (
                <SelectItem key={endpointKey(e)} value={endpointKey(e)}>
                  <span className="inline-flex items-center gap-2">
                    <MethodBadge method={e.method} />
                    <code className="font-mono text-xs">{e.path}</code>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Sandbox key={`${apiId}-${epKey}`} endpoint={endpoint} baseUrl={api.baseUrl} />
      </div>
    </div>
  );
}
