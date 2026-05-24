# Developer Portal

A premium, extensible API documentation + sandbox platform for external developers.

## Stack
- **React 19 + TypeScript (strict)** on **TanStack Start** (file-based routing, SSR-capable)
- **Tailwind CSS v4** + **shadcn/ui**
- **TanStack Query** for server state
- **Zustand** for theme & environment switcher
- **React Hook Form + Zod** for forms
- **Framer Motion** for micro-animations
- **Recharts** for analytics
- **Supabase Auth + Postgres** (via Lovable Cloud) for users, API keys, request history

> Note: The brief specified Vite + React Router. This template uses TanStack Start (Vite under the hood + file-based router from the same family). Functionally equivalent with stronger type safety.

## Architecture

```
src/
├── apis/                       # OpenAPI specs + registry (extensibility surface)
│   ├── api-registry.ts         # Single source of truth for all APIs
│   ├── types.ts                # OpenAPI subset we render against
│   ├── pokeapi/openapi.json    # Live PokéAPI subset
│   └── stub-payments/openapi.json
├── features/
│   ├── auth/AuthShell.tsx
│   ├── docs/EndpointDoc.tsx    # Renders any OpenAPI operation
│   └── sandbox/Sandbox.tsx     # Live request runner + code snippet gen
├── components/
│   ├── layout/                 # Sidebar, Header, CommandPalette, AppShell
│   ├── MethodBadge.tsx StatusBadge.tsx CodeBlock.tsx CopyButton.tsx EmptyState.tsx Skeletons.tsx
│   └── ui/                     # shadcn primitives
├── lib/
│   ├── auth.tsx                # Supabase session provider
│   ├── theme.ts env-store.ts   # Zustand stores
│   └── code-gen.ts             # cURL / fetch / Python generators
└── routes/                     # File-based routing
    ├── __root.tsx login.tsx signup.tsx forgot-password.tsx reset-password.tsx index.tsx
    └── _authed/                # Protected layout: dashboard, catalogue, docs, sandbox, keys, analytics, status, changelog, settings
```

## Extensibility — adding a new API

1. Drop an `openapi.json` under `src/apis/<your-api>/`.
2. Add a registry entry in `src/apis/api-registry.ts`:

```ts
{
  id: "your-api",
  name: "Your API",
  version: "v1",
  baseUrl: "https://api.example.com/v1",
  spec: yourSpec as OpenApiDocument,
  changelog: [...],
  status: "operational",
}
```

That's it. The catalogue, docs renderer, sandbox, command palette, changelog, and status page all pick it up automatically — **zero UI changes**.

## Features
- **OpenAPI-driven docs** — sidebar grouping by tag, parameter tables, request/response schemas, status code badges
- **Interactive sandbox** — editable path/query params, headers, JSON body editor; real PokéAPI calls; latency + status; pretty JSON viewer
- **Code snippet generation** — cURL, JS fetch, Python requests with copy buttons
- **API key management** — create (one-time reveal), masked listing, revoke with confirmation; SHA-256 hashed at rest, RLS scoped per user
- **Analytics dashboard** — Recharts area/bar charts, per-endpoint breakdown
- **Status page** — 90-day uptime bars, incident timeline, global degraded banner
- **Changelog** — filterable by API + type (breaking/feature/fix)
- **Command palette** — `⌘K` / `Ctrl+K`, fuzzy across pages and every endpoint
- **Auth** — sign up / login / forgot / reset, protected routes via `_authed` layout
- **Theme** — dark by default, light mode polished; persisted via Zustand
- **A11y** — aria-labels on icon buttons, semantic landmarks, keyboard navigation
- **Skeletons + empty states** on every async surface

## Running
```bash
bun install
bun dev
```

## Quality notes
- No `useEffect` data fetching — TanStack Query everywhere
- No hardcoded OpenAPI content in JSX
- Business logic isolated in `lib/` and `features/`
- All colors via semantic tokens in `src/styles.css` (oklch)
