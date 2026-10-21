# MealSync API Reference

Base path: **`/api/v1`**. Interactive Swagger UI is served at **`/docs`** when the server is running
(e.g. `http://localhost:5000/docs`).

All JSON responses follow the shape `{ success: boolean, message?: string, data?: ..., token?: ... }`.
Errors thrown as `AppError` return `{ success: false, message }` with the matching status code;
anything else returns `500 Internal Server Error` (see `src/plugins/error-handler.ts`).

## Authentication

- Send `Authorization: Bearer <token>`.
- Tokens are JWTs signed with `JWT_SECRET` (`src/plugins/jwt.ts`). The server refuses to start without it.
- **Sliding expiry:** tokens last **90 days** (`SESSION_TTL` in `src/modules/auth/tokens.ts`). The frontend calls
  `POST /auth/refresh` at most once a day while the app is in use, so active users stay logged in indefinitely.
  Logout is client-side only (the token is discarded; there is no server-side revocation).
- Two token shapes exist:

| Issued by | Payload |
|---|---|
| `POST /auth/login` (admins) | `{ id: <User.id>, email, role: "SUPER_ADMIN" \| "ADMIN" \| "USER" }` |
| `POST /staff-auth/login` (staff) | `{ id: <Staff.id>, staffId: <Staff.id>, role: "USER", staffNumber, firstName, lastName }` |

Auth column legend: **Public** = no token checked · **Token** = any valid JWT · **Admin** = `ADMIN` or `SUPER_ADMIN` · **Super** = `SUPER_ADMIN` only.


---

## Admin auth — `src/modules/auth`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Body `{ email, password }` → `{ token, user }` (password hash is stripped) |
| GET | `/auth/me` | Token | Current admin user |
| POST | `/auth/refresh` | Token | Swap a valid token (admin **or** staff) for a fresh 90-day one → `{ token }`. Re-checks the account in the DB: 401 if the user/staff was deactivated, deleted or never activated. |
| GET | `/auth/users` | Super | List all `User` rows (id, email, role, createdAt) |

## Staff auth — `src/modules/staffAuth`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/staff-auth/activate` | Public | First-time setup. Body `{ staffNumber, pin, confirmPin }` (4-digit numeric PIN). Creates/updates the linked `User` with a bcrypt-hashed PIN. 409 if already activated. |
| POST | `/staff-auth/login` | Public | Body `{ staffNumber, pin }` → `{ token, user }` |
| GET | `/staff-auth/me` | Token | Staff profile incl. QR image |

## Staff — `src/modules/staff`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/staff` | Super | Create staff `{ staffNumber, firstName, lastName, department }`. Generates `qrCodeId` (UUID) and a QR PNG data-URL. |
| POST | `/staff/import` | Super | Multipart `.xlsx` upload. Sheet 1, from row 2: col A staff number, B first name, C last name, D department. Duplicates / incomplete rows are skipped. Returns `{ imported, skipped }`. |
| GET | `/staff` | Super | List all staff |
| GET | `/staff/me` | Token | Staff linked to the current user |
| GET | `/staff/:id` | Super | One staff member |
| PATCH | `/staff/:id` | Super | Update fields incl. `isActive` |
| DELETE | `/staff/:id` | Super | Delete (cascades to attendance and meal selections) |

## Food options (menu) — `src/modules/foodOption`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/food-options` | Admin | Create `{ name, image, mealDate }` — `image` is a string (URL or data-URL) |
| GET | `/food-options` | Token | All options |
| GET | `/food-options/date?date=YYYY-MM-DD` | Token | Options for one day |
| GET | `/food-options/summary?date=YYYY-MM-DD` | Token | Options for a day with `selectionCount` each + `totalSelections` (kitchen demand) |
| GET | `/food-options/:id` | Token | One option |
| PATCH | `/food-options/:id` | Admin | Update name / image / mealDate |
| PATCH | `/food-options/:id/status` | Admin | `{ isActive }` — inactive options can't be selected |
| DELETE | `/food-options/:id` | Admin | Delete (cascades to selections) |

## Meal selections — `src/modules/mealSelection`

The staff ID is taken from the JWT (`staffId ?? id`).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/meal-selections` | Token | `{ foodOptionId, mealDate }` — one selection per staff per day |
| GET | `/meal-selections/my` | Token | All my selections |
| GET | `/meal-selections/my/date?date=` | Token | My selection for a date |
| PATCH | `/meal-selections/:id` | Token | Change food `{ foodOptionId }` |
| DELETE | `/meal-selections/:id` | Token | Remove selection |

**Lock rule** (`service.ts → validateMealDateIsEditable`): a selection can be created/changed/deleted only for
dates **after today**. Exception: **on a Monday, today's (Monday's) selection is still editable.**
Food option must be `isActive`. ⚠️ PATCH/DELETE do not check that the selection belongs to the caller.

## Attendance (serving / scanning) — `src/modules/attendance`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/attendance/scan` | Admin | `{ qrCodeId }` → **preview only**: staff, today's selected meal, servings used/remaining. Errors if QR invalid, staff inactive, no meal selected, or limit reached. |
| POST | `/attendance/serve` | Admin | `{ staffId }` → creates an `Attendance` row (in a transaction with retries), emits socket event `attendance:new` |
| GET | `/attendance/today` | Admin | Today's attendance |
| GET | `/attendance/history` | Admin | All attendance |
| GET | `/attendance/staff/:staffId` | Admin | One staff member's attendance (404 if none) |

**Serving limit:** `MAX_DAILY_SERVINGS = 3` per staff per day (`attendance/constants.ts`).

## Dashboard — `src/modules/dashboard`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/dashboard` | Admin | `{ totalStaff, activeStaff, inactiveStaff, mealsServedToday }` |
| GET | `/dashboard/recent-attendance` | Admin | Latest 10 servings |
| GET | `/dashboard/department-summary` | Admin | Staff headcount per department |

## Reports — `src/modules/reports`

Weeks start on **Monday**.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/reports/today` | Admin | Today's report |
| GET | `/reports/weekly` | Admin | Current week |
| GET | `/reports/monthly` | Admin | Current month |
| GET | `/reports/departments` | Admin | By department |
| GET | `/reports/staff-summary?period=today\|weekly\|monthly` | Admin | Per-staff meal counts (default `today`) |
| GET | `/reports/export?period=` | Admin | `.xlsx` download. `period` = `today` \| `current-week` \| `previous-week` \| `current-month` \| `previous-month` |

## Real-time events (Socket.IO)

Socket.IO shares the HTTP server (`src/plugins/socket.ts`). CORS for sockets currently allows only `http://localhost:5173`.

| Event | Emitted when | Payload |
|---|---|---|
| `attendance:new` | A meal is served | staff, meal, servingNumber, remainingServings, scannedAt |
| `notification:new` | `NotificationService` is called (not currently wired to any flow) | `{ title, message, type, timestamp }` |
