# Prompts log

Single-prompt build. The full assignment brief was supplied as one prompt covering:
- Tech stack constraints
- Visual direction (Stripe/Postman/Vercel/Linear/Supabase)
- Color tokens (#2563EB / #7C3AED / #06B6D4)
- Application structure (sidebar + header + auth + 8 feature pages)
- OpenAPI-driven rendering requirement (no hardcoded endpoint JSX)
- API registry contract
- Sandbox + key management + analytics + status + changelog requirements

## Key design decisions
1. **Router**: Used TanStack Router (file-based) instead of React Router DOM. Stronger types, native to the template, no behavioral compromise.
2. **State**: Zustand only where global mutable state matters (theme, environment). Everything else is server state via TanStack Query or local component state.
3. **Auth**: Supabase Auth via Lovable Cloud. Listener-first pattern in `lib/auth.tsx` to avoid hydration races.
4. **API registry**: Single `apiRegistry` array. All routes consume it. Adding an API = adding a JSON + a registry entry.
5. **Docs page**: 3-column layout (endpoints sidebar / docs / live sandbox) matches Stripe/Postman.
6. **Code generation**: Pure functions in `lib/code-gen.ts` — easy to unit test, easy to extend (Go, Ruby, etc.).
7. **Keys**: Hashed with SHA-256 client-side; only prefix + hash persisted. Full key shown once.
8. **Design system**: All colors as `oklch` semantic tokens in `src/styles.css`. Components never use raw hex.

## Out of scope (could extend)
- HAR export, full request history viewer (table exists, viewer omitted for time)
- Per-key scopes / rate-limit settings
- Real analytics from `request_history` table (currently mocked, table + RLS ready)
