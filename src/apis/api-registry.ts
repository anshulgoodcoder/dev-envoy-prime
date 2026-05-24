import type { ApiDefinition, HttpMethod, OpenApiDocument, ResolvedEndpoint } from "./types";
import pokeapiSpec from "./pokeapi/openapi.json";
import paymentsSpec from "./stub-payments/openapi.json";

const POKE_MD = `# Getting started with the PokéAPI

The PokéAPI is a free, public REST API. No authentication is required.

\`\`\`bash
curl https://pokeapi.co/api/v2/pokemon/pikachu
\`\`\`

## Conventions
- All responses are JSON.
- Resources can be requested by id or slug.
- Endpoints are paginated with \`limit\` / \`offset\`.

## Rate limits
Public endpoints are rate-limited to ~100 req/min per IP.
`;

const PAY_MD = `# Payments API

Demonstration spec — endpoints are not live. Auth via \`Authorization: Bearer <api_key>\`.
`;

export const apiRegistry: ApiDefinition[] = [
  {
    id: "pokeapi",
    name: "PokéAPI",
    version: "v2",
    description: "Public Pokémon REST API used as the live sandbox.",
    baseUrl: "https://pokeapi.co/api/v2",
    spec: pokeapiSpec as unknown as OpenApiDocument,
    docsMarkdown: POKE_MD,
    status: "operational",
    sdks: [
      { language: "JavaScript", url: "https://github.com/PokeAPI/pokedex-promise-v2" },
      { language: "Python", url: "https://github.com/PokeAPI/pokebase" },
    ],
    changelog: [
      { version: "2.7.0", date: "2025-09-12", type: "feature", title: "Added gen-9 Pokémon", notes: "Includes Paldean forms and new abilities." },
      { version: "2.6.1", date: "2025-06-30", type: "fix", title: "Pagination edge case", notes: "Fixed an off-by-one in `next` cursors at the last page." },
      { version: "2.6.0", date: "2025-04-04", type: "breaking", title: "Renamed `is_legendary` to `legendary`", notes: "Old field removed after 6 months of deprecation." },
    ],
  },
  {
    id: "payments",
    name: "Payments",
    version: "v0.4.1",
    description: "Demonstration payments API — second registry entry, zero UI changes required.",
    baseUrl: "https://api.example.com/v1",
    spec: paymentsSpec as unknown as OpenApiDocument,
    docsMarkdown: PAY_MD,
    status: "degraded",
    sdks: [{ language: "TypeScript", url: "https://example.com/sdk-ts" }],
    changelog: [
      { version: "0.4.1", date: "2025-10-22", type: "fix", title: "Idempotency keys honored on retries" },
      { version: "0.4.0", date: "2025-08-01", type: "feature", title: "Added refunds endpoint" },
    ],
  },
];

export function getApi(id: string): ApiDefinition | undefined {
  return apiRegistry.find((a) => a.id === id);
}

const METHODS: HttpMethod[] = ["get", "post", "put", "patch", "delete"];

export function listEndpoints(api: ApiDefinition): ResolvedEndpoint[] {
  const out: ResolvedEndpoint[] = [];
  for (const [path, item] of Object.entries(api.spec.paths)) {
    for (const m of METHODS) {
      const op = item[m];
      if (op) out.push({ apiId: api.id, path, method: m, operation: op });
    }
  }
  return out;
}

export function groupByTag(endpoints: ResolvedEndpoint[]): Record<string, ResolvedEndpoint[]> {
  const groups: Record<string, ResolvedEndpoint[]> = {};
  for (const e of endpoints) {
    const tag = e.operation.tags?.[0] ?? "Other";
    (groups[tag] ??= []).push(e);
  }
  return groups;
}

export function endpointKey(e: { method: string; path: string }): string {
  return `${e.method.toUpperCase()} ${e.path}`;
}
