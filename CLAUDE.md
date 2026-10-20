# Working in this repo

MealSync backend (Fastify + Prisma + Neon Postgres). Read `README.md` first. The frontend is in the
sibling repo `Sky-MealSync`, which also holds the system-level docs (`docs/ARCHITECTURE.md`, `docs/PRD.md`, `docs/KNOWN_ISSUES.md`).

## Keep the docs current (required for every change)

In the same branch/PR as any code change:
- Add a line to `CHANGELOG.md` under **Unreleased** (use **Database** for migrations, **Security** for auth changes).
- Endpoint added/changed/removed, or auth on a route changed → update `docs/API.md`.
- `prisma/schema.prisma` changed → update `docs/DATABASE.md`.
- New env var → update `README.md` table and `.env.example`.
- Business rule changed (lock times, serving limits, roles) → update `Sky-MealSync/docs/PRD.md`.
- Fixed something listed in `Sky-MealSync/docs/KNOWN_ISSUES.md` → mark it resolved there.

## Safety

- The only database is **production**. Never run `prisma migrate dev`, `migrate reset`, `db push`, or the seed
  against it. Confirm which DB `DATABASE_URL` points at before any Prisma command that writes.
- Work on a branch; never commit directly to `main`.
- Verify with `npm run build` (there are no tests).
