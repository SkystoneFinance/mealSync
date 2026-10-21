# MealSync Database

- **Engine:** PostgreSQL hosted on **Neon**
- **ORM:** Prisma 6 — schema in [`prisma/schema.prisma`](../prisma/schema.prisma)
- **Connection:** `DATABASE_URL` environment variable

> ⚠️ There is currently **one database: production.** Any local run pointing at it reads and writes live data,
> and `prisma migrate dev` against it can alter or reset production tables. Set up a separate dev database
> (a Neon child branch of production) before doing schema work. See [Working safely](#working-safely).

## Entity relationships

```
Staff 1 ──── 0..1 User            (login account; admins have no Staff)
Staff 1 ──── *    MealSelection * ──── 1 FoodOption
Staff 1 ──── *    Attendance        (one row per meal served)
Staff 1 ──── *    WeeklySubmission * ──── 1 MenuWeek
```

## Tables

### `Staff` — an employee who can eat
| Field | Notes |
|---|---|
| `id` | UUID |
| `staffNumber` | Unique. What staff type to log in |
| `firstName`, `lastName`, `department` | `department` is free text (no departments table) |
| `phoneNumber` | Optional, unique. Left over from an earlier OTP login design |
| `qrCodeId` | Unique UUID encoded in the staff QR code |
| `qrImage` | QR code PNG stored as a base64 data-URL |
| `isActive` | Inactive staff can't log in or be served |
| `hasActivedAccount` | Activation flag (note spelling). Activation logic actually checks `User.password` |

### `User` — a login account
| Field | Notes |
|---|---|
| `email`, `password` | Admins: email + bcrypt password. Staff: no email; `password` holds the bcrypt-hashed 4-digit PIN |
| `role` | `SUPER_ADMIN`, `ADMIN` (kitchen/chef), `USER` (staff) |
| `staffId` | Set for staff users; `null` for admins |
| `isActive` | |

### `FoodOption` — a dish offered on a specific day
| Field | Notes |
|---|---|
| `name`, `image` | `image` is a string (URL or data-URL) |
| `mealDate` | The day it's offered |
| `isActive` | Inactive options can't be selected |

### `MealSelection` — a staff member's choice for a day
| Field | Notes |
|---|---|
| `staffId`, `mealDate` | **Unique on (`staffId`, `mealDate`)**: one choice per person per day |
| `foodOptionId` | The dish, or `null` when `noMeal` is true |
| `noMeal` | Staff chose "No meal required" |

Written only by `PUT /meal-plan`. Rows only count for a week if the staff member has a `WeeklySubmission` for it.

### `DishPhoto` — our own photo of a dish
| Field | Notes |
|---|---|
| `nameKey` | Normalised dish name, unique (e.g. "fried rice and chicken") |
| `mimeType`, `data` | The image (bytea, ~200–400 KB after the app resizes it) |
| `uploadedById` | User who took it |

`FoodOption.image` holds either a pasted outside URL or `/api/v1/dish-photos/<id>/image?v=…` once we have a photo.

### `MenuWeek` — one row per planned week
| Field | Notes |
|---|---|
| `weekStart` | The Monday (UTC midnight). Unique |
| `closedDates` | Days the kitchen is closed |
| `publishedAt`, `publishedById` | Set when the chef publishes; staff can only choose after this |

### `WeeklySubmission` — a staff member submitted their plan for a week
| Field | Notes |
|---|---|
| `staffId`, `menuWeekId` | Unique together |
| `submittedAt` | First submission (the time shown in the chef summary) |
| `updatedAt` | Last edit |

### `Attendance` — a meal actually served
| Field | Notes |
|---|---|
| `staffId` | |
| `mealDate` | Start of the day served (used for daily limits and reports) |
| `scannedAt` | Exact timestamp |

Up to `MAX_DAILY_SERVINGS` (3) rows per staff per day.

## Dates and time zones

"Today" is computed with `startOfDay(new Date())` in the **server's time zone**. If the server runs in UTC
and users are in another zone, the day boundary is shifted. Keep the server TZ and the frontend's date strings in agreement.

## Migrations

History in `prisma/migrations/` (oldest first): init → staff schema → mealsyncs → QR image → auth →
food selection → food option meal date → staff phone/OTP → remove OTP, add activation status → **weekly meal planning** (2026-10-21: `noMeal`, nullable `foodOptionId`, `MenuWeek`, `WeeklySubmission`; additive only) → **dish photos** (`DishPhoto`, additive).

| Task | Command |
|---|---|
| Generate client after schema edits | `npm run prisma:generate` |
| Create + apply a migration (**dev DB only**) | `npm run prisma:migrate -- --name <change>` |
| Apply existing migrations to production | `npx prisma migrate deploy` |
| Browse data | `npm run prisma:studio` |
| Seed test admin users | `npm run prisma:seed` |

The seed (`prisma/seed.ts`) upserts three test users with a known shared password. **Do not run it against
production**, and if it has been run there, change or remove those accounts.

## Working safely

1. In Neon, create a **child branch** of the production branch (e.g. `dev`). It starts as a full copy of production's schema
   and data, so no seeding is needed. Remember that it contains real staff data.
2. Put the dev branch's connection string in your local `.env` as `DATABASE_URL`, and check the host name before running anything.
   To get a fresh copy later, reset the child branch from its parent in the Neon console.
3. Develop migrations with `prisma migrate dev` locally.
4. After merging, apply to production with `prisma migrate deploy` (never `migrate dev` / `migrate reset`).
