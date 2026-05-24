// Minimal OpenAPI 3.x subset we actually render.
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface OpenApiParameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: { type?: string; example?: unknown; enum?: string[] };
  example?: unknown;
}

export interface OpenApiRequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: unknown; example?: unknown }>;
}

export interface OpenApiResponse {
  description?: string;
  content?: Record<string, { schema?: unknown; example?: unknown }>;
}

export interface OpenApiOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
}

export type OpenApiPathItem = Partial<Record<HttpMethod, OpenApiOperation>>;

export interface OpenApiDocument {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: { url: string; description?: string }[];
  tags?: { name: string; description?: string }[];
  paths: Record<string, OpenApiPathItem>;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  type: "breaking" | "feature" | "fix";
  title: string;
  notes?: string;
}

export interface SdkLink {
  language: string;
  url: string;
}

export interface ApiDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  baseUrl: string;
  spec: OpenApiDocument;
  docsMarkdown?: string;
  changelog?: ChangelogEntry[];
  sdks?: SdkLink[];
  status?: "operational" | "degraded" | "outage";
}

export interface ResolvedEndpoint {
  apiId: string;
  path: string;
  method: HttpMethod;
  operation: OpenApiOperation;
}
