# 42 MCP Server — `tools.ts` Design

## Context

This repo wraps the 42 Intra API (`https://api.intra.42.fr`) as an MCP server, inspired by the
structure of [`nao-metabase-mcp-server`](https://github.com/getnao/nao-mcp-servers/tree/main/nao-metabase-mcp-server)
(`index.ts` entry point → tool registry → shared HTTP client).

Work on this project is split between Mateo and this spec/implementation:

**Owned by Mateo (outside this spec):**
- `package.json`, `tsconfig.json`, `.env.example`, `README.md`
- `src/index.ts` — creates the `McpServer`, registers tools from `tools.ts`, connects `StdioServerTransport`
- `src/auth.ts` — Client Credentials Flow: fetch/cache/refresh of the 42 API access token
- `src/client.ts` — exports `axiosInstance: AxiosInstance`, pre-configured with:
  - `baseURL: "https://api.intra.42.fr"`
  - a request interceptor that attaches the `Authorization` header via `auth.ts`
  - a response interceptor that retries once on 401 (refresh token) and once on 429 (respect `Retry-After`)

**Owned by this spec (what the implementation plan covers):**
- `src/tools.ts` — the MCP tool registry: types, zod input schemas, handlers

## Decisions carried over from brainstorming

- Auth: Client Credentials Flow (app token, no user login/browser redirect).
- Output format: raw JSON, no Markdown formatting layer (no `--md` flag, no `formatters.ts`).
- Distribution: local personal use only, no npm publish for now.
- v1 resource scope: **Profils & progression** + **Vie de campus** (coalitions, évaluations/teams explicitly deferred).
- File structure: a single flat `src/tools.ts` (not split into a `tools/` folder per domain).

## Interface contract assumed

```ts
import { axiosInstance } from "./client.js"; // already-authenticated AxiosInstance
```

`tools.ts` calls `axiosInstance.get(path, { params })` and trusts that authentication, retries, and
error shaping happen upstream in `client.ts`. Handlers do **not** add their own try/catch — a thrown
`AxiosError` propagates to the MCP SDK, which converts it into a tool-call error automatically (this
matches the reference implementation, which also has no per-handler error handling).

## Types (defined locally in `tools.ts`, exported for `index.ts` to use)

```ts
type ToolConfig = {
  title: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
};

type ToolHandler = (args: any) => Promise<{ content: { type: "text"; text: string }[] }>;

type Tool = { config: ToolConfig; handler: ToolHandler };

export const tools: Record<string, Tool> = { /* ... */ };
```

These types are owned by `tools.ts` (not `client.ts`) — they describe the MCP tool registry shape,
which is independent of the HTTP client.

## Tools (10)

Every handler returns the same shape:
```ts
{ content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] }
```

User-supplied `idOrLogin` path segments are URL-encoded via `encodeURIComponent` before being
interpolated into the path.

### Profils & progression

| Tool | Input (zod) | Call |
|---|---|---|
| `42-get-user` | `idOrLogin: z.string()` | `GET /v2/users/${idOrLogin}` |
| `42-search-users` | `campusId?: z.number()`, `login?: z.string()`, `poolYear?: z.string()`, `poolMonth?: z.string()`, `pageSize?: z.number().default(30)`, `pageNumber?: z.number().default(1)` | `GET /v2/users` with `params: {"filter[campus_id]": campusId, "filter[login]": login, "filter[pool_year]": poolYear, "filter[pool_month]": poolMonth, "page[size]": pageSize, "page[number]": pageNumber}` |
| `42-get-user-cursus` | `idOrLogin: z.string()` | `GET /v2/users/${idOrLogin}/cursus_users` |
| `42-get-user-projects` | `idOrLogin: z.string()`, `cursusId?: z.number()` | `GET /v2/users/${idOrLogin}/projects_users` with `params: {"filter[cursus_id]": cursusId}` |
| `42-get-user-achievements` | `idOrLogin: z.string()` | `GET /v2/users/${idOrLogin}/achievements` |

### Vie de campus

| Tool | Input (zod) | Call |
|---|---|---|
| `42-list-campus` | `pageSize?: z.number().default(30)`, `pageNumber?: z.number().default(1)` | `GET /v2/campus` with `params: {"page[size]": pageSize, "page[number]": pageNumber}` |
| `42-get-campus-locations` | `campusId: z.number()`, `activeOnly?: z.boolean().default(true)` | `GET /v2/campus/${campusId}/locations` with `params: {"filter[active]": activeOnly}` |
| `42-list-events` | `campusId: z.number()`, `pageSize?: z.number().default(30)`, `pageNumber?: z.number().default(1)` | `GET /v2/campus/${campusId}/events` with `params: {"page[size]": pageSize, "page[number]": pageNumber}` |
| `42-get-event` | `eventId: z.number()` | `GET /v2/events/${eventId}` |
| `42-list-exams` | `campusId: z.number()`, `pageSize?: z.number().default(30)`, `pageNumber?: z.number().default(1)` | `GET /v2/campus/${campusId}/exams` with `params: {"page[size]": pageSize, "page[number]": pageNumber}` |

## Error handling

Out of scope for `tools.ts` — handled upstream in `client.ts` (401 refresh+retry, 429 backoff+retry,
42 API error body surfaced via the thrown error's message). Handlers in `tools.ts` add no try/catch
of their own.

## Testing

Test-first: mock `axiosInstance` (the `./client.js` module) and assert, per tool, that the handler
calls the expected endpoint with the expected `params`, and returns the expected `CallToolResult`
shape (`{ content: [{ type: "text", text: ... }] }`). No integration tests against the real 42 API in
this spec — that requires `client.ts`/`auth.ts` to exist and is manual verification once Mateo's
pieces are wired up.

## Out of scope (v1)

- Coalitions & classements, évaluations & teams (deferred resource categories)
- Markdown output mode / `--md` flag / `formatters.ts`
- npm publishing setup
- `index.ts`, `auth.ts`, `client.ts`, `package.json`, `tsconfig.json`, `README.md`, `.env.example`
