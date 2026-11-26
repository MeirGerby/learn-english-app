# AGENTS.md (english web)

Rules for `src/`. The root `AGENTS.md` and `CLAUDE.md` still apply.

## Folder structure

Imports go one way: `routes/` -> `features/<name>/` -> shared (`components/`, `hooks/`, `lib/`, `context/`, `assets/`).

- Put a file in the smallest folder that holds every file that imports it. Move it to a shared folder when a second feature needs it. Move it to `libs/` only when a second app needs it.
- A feature never imports another feature. Shared code never imports `features/` or `routes/`.
- Route files hold only router config (search schema, `beforeLoad` guards, loader). Their component comes from a feature.
- Each game is its own feature (`features/scramble/`, ...). Code two games share lives in `components/`, `hooks/` or `lib/`.
- Use relative imports. There is no path alias. File names are kebab-case.

## Data

- Server data goes through TanStack Query with the tRPC options proxy: `useTRPC()` from `lib/trpc`, then `useQuery(trpc.x.y.queryOptions())`.
- Fire-and-forget writes from a game (`recordAnswer`, `recordGameCompleted`) use `lib/user-stats`, which calls the vanilla `trpcClient` and never blocks the game.
- Auth and placement state come from `context/auth-context` and `context/placement-context`. `main.tsx` waits for both before it mounts the router, so a route guard never sees a half-loaded user.
