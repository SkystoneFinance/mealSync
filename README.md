# MealSync — Backend API

REST + WebSocket API for **MealSync**, Skystone Finance's staff meal management system. Staff pre-select their meals,
the kitchen serves them by scanning each person's QR code, and admins get attendance dashboards and Excel reports.

| | |
|---|---|
| Frontend repo | [SkystoneFinance/Sky-MealSync](https://github.com/SkystoneFinance/Sky-MealSync) (deployed on Vercel). Has the **product docs**: [overview & architecture](https://github.com/SkystoneFinance/Sky-MealSync/blob/main/docs/ARCHITECTURE.md), [PRD](https://github.com/SkystoneFinance/Sky-MealSync/blob/main/docs/PRD.md), [known issues](https://github.com/SkystoneFinance/Sky-MealSync/blob/main/docs/KNOWN_ISSUES.md) |
| API reference | [docs/API.md](docs/API.md) (also Swagger UI at `/docs` on a running server) |
| Database | [docs/DATABASE.md](docs/DATABASE.md) |
| Changes | [CHANGELOG.md](CHANGELOG.md) |

## Stack

Node.js · TypeScript · **Fastify 5** · **Prisma 6** on **Neon PostgreSQL** · Zod validation · `@fastify/jwt` + bcrypt ·
Socket.IO (live scan feed) · ExcelJS (staff import, report export) · `qrcode` (staff QR generation)

## Getting started

```bash
npm install
cp .env.example .env    # then fill in values (ask the team for them)
npm run prisma:generate
npm run dev             # http://localhost:5000, Swagger at /docs
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string (Neon). Use the **dev branch** URL locally |
| `JWT_SECRET` | **yes** | Signs login tokens. The server refuses to start without it. Use a different random value per environment (`openssl rand -base64 48`). Changing it logs everyone out. |
| `PORT` | no | Default `5000`. On macOS, AirPlay Receiver already uses 5000; use e.g. `5050` and point the frontend's `VITE_API_URL` at it |
| `HOST` | no | Default `0.0.0.0` |
| `NODE_ENV` | no | |

> ⚠️ The only database today is **production**. Use a separate dev database before running migrations or seed
> scripts. See [docs/DATABASE.md](docs/DATABASE.md#working-safely).

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Run with hot reload (`tsx watch src/app/server.ts`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build (`node dist/app/server.js`) |
| `npm run prisma:generate` / `prisma:migrate` / `prisma:studio` / `prisma:seed` | Prisma helpers (see DATABASE.md) |
| `npm run lint` / `npm run format` | ESLint / Prettier |

There are no automated tests yet.

## Project structure

```
src/
  app/
    server.ts        entry point: builds the app and listens
    app.ts           Fastify instance
    register.ts      registers plugins + all modules under /api/v1   ← start here
  plugins/           cors, jwt, prisma, socket.io, swagger, error handler, zod validate()
  middleware/        auth.ts (authenticate), authorize.ts (role check)  — role.ts is an older duplicate
  modules/<feature>/ one folder per feature, same layout in each:
      routes.ts      URL → controller, auth preHandlers
      controller.ts  parse/validate request, shape response
      service.ts     business rules
      repository.ts  Prisma queries
      schema.ts      Zod input schemas
      types.ts
  services/socket.ts global Socket.IO accessor
  utils/             AppError, date helpers
  shared/            mostly empty placeholder files
prisma/              schema, migrations, seed
```

Feature modules: `auth` (admin login), `staffAuth` (staff activation/login), `staff`, `foodOption`,
`mealSelection`, `attendance` (scan & serve), `dashboard`, `reports`, `notification` (socket helper, unused).

### Adding an endpoint

1. Add Zod schema in `schema.ts`, query in `repository.ts`, logic in `service.ts`, handler in `controller.ts`.
2. Register the route in `routes.ts` with `preHandler: [authenticate, authorize("ADMIN", "SUPER_ADMIN")]` as appropriate.
3. New modules must be registered in `src/app/register.ts`.
4. Document it in [docs/API.md](docs/API.md) and add a line to [CHANGELOG.md](CHANGELOG.md).

## Deployment

The frontend at `https://sky-meal-sync.vercel.app` calls this API. Allowed CORS origins are hard-coded in
`src/plugins/cors.ts` (update them if the frontend URL changes, including for Vercel preview URLs).

**Hosting: [Render](https://render.com)** (web service). Auto-deploys on every push/merge to `main`.
Env vars are managed in the Render dashboard → service → **Environment**. Changing one triggers a redeploy.
Required there: `DATABASE_URL` (Neon production branch) and `JWT_SECRET`.

### Database migrations on deploy

Check whether the Render build command runs `npx prisma migrate deploy`. If it doesn't, apply new migrations to
production **before** merging a PR that contains them. From your machine, with the production connection string:

```bash
DATABASE_URL="<production connection string>" npx prisma migrate deploy
```

Write migrations to be additive (new nullable columns / tables) so the currently deployed code keeps working
until the new code is live.

## Contributing workflow

1. Branch from `main` (`feature/...`, `fix/...`, `docs/...`).
2. Make the change, run `npm run build`, and test locally against a **dev** database.
3. Update `CHANGELOG.md` (under *Unreleased*) and any affected docs.
4. Open a PR into `main`.
