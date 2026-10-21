# Changelog — MealSync Backend

All notable changes to this repo are recorded here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Newest first.
Add entries under **Unreleased** in the same PR as the change; when a batch is deployed, rename the
heading to the deploy date.

Sections: **Added** · **Changed** · **Fixed** · **Removed** · **Security** · **Database** (migrations — call these out explicitly).

## [Unreleased]

### Added
- Two planning weeks: the chef can publish next week and the week after; staff can choose for either once published.
- `GET /meal-plan?weekStart=` for any week (read-only outside the open window) and `GET /meal-plan/status` for the two planning weeks.
- Meal Preparation Summary for weeks chosen day by day before weekly planning (`isLegacy`).
- `GET /attendance/today` includes the dish each person chose (`meal`).
- **Our own dish photos**: `POST /food-options/:id/photo` (on or after the day), `GET /food-options/photo-status`, public `GET /dish-photos/:id/image`. A photo is stored per dish name and replaces the pasted image on every dish with that name; new dishes with a known name use it automatically, so `image` is now optional on create.

### Database
- Migration `20261021124226_dish_photos` (additive): `DishPhoto` table. **Apply to production before deploying.**

### Fixed
- Scanning, serving and the dashboard now use the Lagos calendar day instead of the server's time zone (`businessToday()` in `mealPlan/schedule.ts`), so they match how meal dates are stored.

## 2026-10-21

### Added
- **Weekly meal planning** (`src/modules/mealPlan`): staff choose next week's meals (a dish or "No meal required" per day) via `GET/PUT /meal-plan`. The chef marks closed days, publishes and views the Meal Preparation Summary (+ Excel) via `/menu-weeks/*`. Schedule: publish due Wed 17:00, staff deadline Thu 17:00, hidden close Thu 19:00 (Africa/Lagos).

### Changed
- Scanning refuses staff who chose "No meal required" for today.
- Deleting a dish that someone has chosen is refused (409); disable it instead.
- Validation errors now return 400 with the reason instead of 500. Fastify's own 4xx errors keep their status.

### Removed
- `POST /meal-selections`, `PATCH /meal-selections/:id`, `DELETE /meal-selections/:id` and the day-by-day lock (incl. the Monday exception). Also fixes anyone being able to edit anyone's selection by ID.

### Database
- Migration `20261021110013_weekly_meal_planning` (additive): `MealSelection.noMeal`, nullable `MealSelection.foodOptionId`, new `MenuWeek` and `WeeklySubmission` tables. **Apply to production before deploying.**

### Security
- Staff management routes (`/staff`, except `/staff/me`) now require a SUPER_ADMIN token. Attendance, dashboard and reports routes require ADMIN or SUPER_ADMIN. Previously they were open to anyone.

## 2026-10-20

### Added
- `POST /api/v1/auth/refresh`: swaps a valid admin or staff token for a fresh one after re-checking the account is still active (sliding sessions).
- Project documentation: `README.md`, `docs/API.md`, `docs/DATABASE.md`, `CHANGELOG.md`, `.env.example`, `CLAUDE.md`.

### Changed
- Login tokens now expire after 90 days (previously never). Active users are renewed automatically by the frontend.
- Token payloads are built in one place (`src/modules/auth/tokens.ts`).

### Security
- **`JWT_SECRET` is now required.** The server refuses to start without it instead of falling back to a default string published in the repo. **Set it on Render before deploying.** Doing so logs every user out once.
- Admin login no longer returns the user's password hash.

---

## History before this changelog (reconstructed from git, 2026-07-20 → 2026-09-28)

Commit messages from this period are brief, so this is a summary rather than a precise record.

- **2026-09-28** — Current Monday's meal selection stays editable on Mondays ("monday is unlocked").
- **2026-09-25** — Staff log in with staff number + 4-digit PIN. **Database:** removed staff OTP, added `hasActivedAccount`.
- **2026-09-22 → 09-24** — Serving limit of 3 per staff per day; scan split into preview (`/scan`) and confirm (`/serve`).
- **2026-09-15 → 09-21** — Food options (daily menu) and meal-selection modules; `/staff-auth/me`.
- **2026-09-11** — All routes moved under `/api/v1`.
- **2026-08-28 → 09-02** — **Database:** `FoodOption` and `MealSelection` tables, food-option meal date, staff phone/OTP (later removed). Report changes.
- **2026-08-05 → 08-07** — Admin auth and roles (`SUPER_ADMIN`, `ADMIN`, `USER`), seed test users, CORS for the Vercel frontend. **Database:** `User` table.
- **2026-07-27 → 07-30** — Dashboard and reports modules, Excel export, staff summary.
- **2026-07-13 → 07-22** — Initial staff and attendance modules, QR image per staff. **Database:** initial schema.
