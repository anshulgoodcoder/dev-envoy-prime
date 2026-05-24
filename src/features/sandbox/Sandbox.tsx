import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Play, Plus, Trash2 } from "lucide-react";
import type { OpenApiParameter, ResolvedEndpoint } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MethodBadge } from "@/components/MethodBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { CodeBlock } from "@/components/CodeBlock";
import { toCurl, toFetch, toPython, type RequestShape } from "@/lib/code-gen";
import { useAuth } from "@/lib/auth";

interface Props {
  endpoint: ResolvedEndpoint;
  baseUrl: string;
}

interface ApiResponse {
  status: number;
  latency: number;
  bodyText: string;
  isJson: boolean;
}

export function Sandbox({ endpoint, baseUrl }: Props) {
  const { session } = useAuth();
  const params = endpoint.operation.parameters ?? [];
  const pathParams = useMemo(() => params.filter((p) => p.in === "path"), [params]);
  const queryParams = useMemo(() => params.filter((p) => p.in === "query"), [params]);

  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Array<{ k: string; v: string }>>([
    { k: "Accept", v: "application/json" },
  ]);
  const [bodyText, setBodyText] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef("");

  // Init defaults whenever endpoint changes
  useEffect(() => {
    const sig = `${endpoint.apiId}|${endpoint.method}|${endpoint.path}`;
    if (initRef.current === sig) return;
    initRef.current = sig;

    setPathValues(
      Object.fromEntries(pathParams.map((p) => [p.name, String(p.schema?.example ?? "")])),
    );
    setQueryValues(
      Object.fromEntries(
        queryParams
          .filter((p) => p.schema?.example !== undefined)
          .map((p) => [p.name, String(p.schema?.example ?? "")]),
      ),
    );
    const exampleBody = endpoint.operation.requestBody?.content?.["application/json"]?.example;
    setBodyText(exampleBody !== undefined ? JSON.stringify(exampleBody, null, 2) : "");
    setResponse(null);
    setError(null);
  }, [endpoint, pathParams, queryParams]);

  const builtRequest: RequestShape = useMemo(() => {
    let url = baseUrl + endpoint.path;
    for (const [k, v] of Object.entries(pathValues)) {
      url = url.replace(`{${k}}`, encodeURIComponent(v || `{${k}}`));
    }
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(queryValues)) {
      if (v !== "") qs.append(k, v);
    }
    const q = qs.toString();
    if (q) url += `?${q}`;

    const headerObj: Record<string, string> = {};
    for (const { k, v } of headers) if (k.trim()) headerObj[k.trim()] = v;
    if (session?.access_token && !headerObj.Authorization) {
      headerObj.Authorization = `Bearer ${session.access_token.slice(0, 12)}…`;
    }

    let body: unknown;
    if (bodyText.trim() && endpoint.method !== "get") {
      try {
        body = JSON.parse(bodyText);
        if (!headerObj["Content-Type"]) headerObj["Content-Type"] = "application/json";
      } catch {
        body = bodyText;
      }
    }
    return { method: endpoint.method, url, headers: headerObj, body };
  }, [baseUrl, endpoint, pathValues, queryValues, headers, bodyText, session]);

  async function send() {
    setLoading(true);
    setError(null);
    const started = performance.now();
    try {
      const realHeaders = { ...builtRequest.headers };
      // Replace masked token with real bearer
      if (session?.access_token) realHeaders.Authorization = `Bearer ${session.access_token}`;

      const init: RequestInit = { method: builtRequest.method.toUpperCase(), headers: realHeaders };
      if (builtRequest.body !== undefined && endpoint.method !== "get") {
        init.body =
          typeof builtRequest.body === "string"
            ? builtRequest.body
            : JSON.stringify(builtRequest.body);
      }
      const res = await fetch(builtRequest.url, init);
      const text = await res.text();
      let isJson = false;
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
        isJson = true;
      } catch {
        /* keep text */
      }
      setResponse({
        status: res.status,
        latency: Math.round(performance.now() - started),
        bodyText: pretty,
        isJson,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-muted/40 px-4 py-3 flex items-center gap-2">
        <MethodBadge method={endpoint.method} />
        <code className="font-mono text-xs truncate flex-1">{endpoint.path}</code>
      </div>

      <Tabs defaultValue="request" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-9 bg-transparent p-0 gap-2">
            <TabsTrigger value="request" className="data-[state=active]:bg-muted/60 text-xs">Request</TabsTrigger>
            <TabsTrigger value="headers" className="data-[state=active]:bg-muted/60 text-xs">Headers</TabsTrigger>
            <TabsTrigger value="snippets" className="data-[state=active]:bg-muted/60 text-xs">Code</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="request" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
          {pathParams.length > 0 && (
            <ParamFieldset title="Path parameters" params={pathParams} values={pathValues} onChange={setPathValues} />
          )}
          {queryParams.length > 0 && (
            <ParamFieldset title="Query parameters" params={queryParams} values={queryValues} onChange={setQueryValues} />
          )}
          {endpoint.method !== "get" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Request body (JSON)</Label>
              <Textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="font-mono text-xs min-h-[140px]"
                spellCheck={false}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="headers" className="flex-1 overflow-y-auto p-4 space-y-2 mt-0">
          {headers.map((h, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Header"
                value={h.k}
                onChange={(e) => {
                  const next = [...headers];
                  next[i] = { ...next[i], k: e.target.value };
                  setHeaders(next);
                }}
                className="h-8 text-xs font-mono"
              />
              <Input
                placeholder="Value"
                value={h.v}
                onChange={(e) => {
                  const next = [...headers];
                  next[i] = { ...next[i], v: e.target.value };
                  setHeaders(next);
                }}
                className="h-8 text-xs font-mono"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setHeaders(headers.filter((_, j) => j !== i))}
                aria-label="Remove header"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setHeaders([...headers, { k: "", v: "" }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add header
          </Button>
          {session && (
            <p className="text-[11px] text-muted-foreground pt-2 border-t">
              Logged-in bearer token is auto-injected on Send.
            </p>
          )}
        </TabsContent>

        <TabsContent value="snippets" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0">
          <CodeBlock language="curl" code={toCurl(builtRequest)} maxHeight="180px" />
          <CodeBlock language="javascript" code={toFetch(builtRequest)} maxHeight="200px" />
          <CodeBlock language="python" code={toPython(builtRequest)} maxHeight="200px" />
        </TabsContent>
      </Tabs>

      <div className="border-t p-3 bg-muted/30 flex items-center gap-2">
        <Button onClick={send} disabled={loading} className="gradient-brand text-white border-0 hover:opacity-95 h-9">
          {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Play className="h-4 w-4 mr-1.5" />}
          Send Request
        </Button>
        {response && (
          <div className="flex items-center gap-2 text-xs">
            <StatusBadge status={response.status} />
            <span className="text-muted-foreground">{response.latency} ms</span>
          </div>
        )}
      </div>

      <div className="border-t max-h-[40vh] overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
          Response
        </div>
        <div className="overflow-auto p-4">
          {error ? (
            <div className="text-xs text-destructive font-mono whitespace-pre-wrap">{error}</div>
          ) : response ? (
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">{response.bodyText}</pre>
          ) : (
            <div className="text-xs text-muted-foreground">Press Send to call the API.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ParamFieldset({
  title,
  params,
  values,
  onChange,
}: {
  title: string;
  params: OpenApiParameter[];
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold mb-1">{title}</legend>
      {params.map((p) => (
        <div key={p.name} className="grid grid-cols-[140px_1fr] items-center gap-2">
          <Label className="text-xs font-mono truncate" htmlFor={`p-${p.name}`}>
            {p.name}
            {p.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Input
            id={`p-${p.name}`}
            value={values[p.name] ?? ""}
            placeholder={p.schema?.example != null ? String(p.schema.example) : p.schema?.type ?? ""}
            onChange={(e) => onChange({ ...values, [p.name]: e.target.value })}
            className="h-8 text-xs font-mono"
          />
        </div>
      ))}
    </fieldset>
  );
}
