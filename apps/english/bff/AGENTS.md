# AGENTS.md (english BFF)

Rules for the BFF. The root `AGENTS.md` and `CLAUDE.md` still apply.

## Layout

- One folder per domain: `<domain>/<domain>.router.ts` holds the tRPC procedures, `<domain>/<domain>.service.ts` holds the logic and the Drizzle queries. There is no repository layer.
- A service is a class whose constructor takes its dependencies from the awilix cradle (`{ db, config, logger, otherService }`). Register it in `container.ts`.
- Input and output schemas live in `@learn-english/english-contract`, never in the BFF, so the web reads the same types.
- Guard with `authedProcedure` or `adminProcedure` from `trpc.ts`. Throw a `TRPCError` with a client code (`UNAUTHORIZED`, `CONFLICT`, `BAD_REQUEST`, `NOT_FOUND`) for an expected failure; anything else becomes a logged `INTERNAL_SERVER_ERROR`.

## Tests

- `*.spec.ts` are unit specs: no database, no network. `src/test/unit-setup.ts` gives a database URL that points nowhere, so a spec that runs a query fails.
