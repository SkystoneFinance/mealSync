import { AppError } from "../../utils/error";

// =========================================
// WEEKLY MEAL PLANNING SCHEDULE
// =========================================
//
// Staff choose meals for NEXT week (Mon–Fri). For a week starting on Monday M:
//
//   Tuesday   00:00  (M − 6d)  chef reminder banner starts (if not published)
//   Wednesday 17:00  (M − 5d)  chef should have published the menu
//   Thursday  17:00  (M − 4d)  deadline shown to staff
//   Thursday  19:00  (M − 4d)  hard close: no more submissions; summary confirmed
//   Friday                     chef gets budget approval and shops
//
// All wall-clock times are Africa/Lagos (UTC+1, no daylight saving).
// Meal dates are stored as UTC midnight "date only" values, like the rest
// of the app (FoodOption.mealDate, MealSelection.mealDate).

export const BUSINESS_UTC_OFFSET_HOURS = 1; // Africa/Lagos

export const SCHEDULE = {
  reminderFrom: { daysBefore: 6, hour: 0 },
  publishDue: { daysBefore: 5, hour: 17 },
  deadline: { daysBefore: 4, hour: 17 },
  hardClose: { daysBefore: 4, hour: 19 },
} as const;

export const WORKING_DAYS = 5;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY);
}

// UTC-midnight date for the current business (Lagos) calendar day
function businessToday(now: Date) {
  const wall = new Date(
    now.getTime() + BUSINESS_UTC_OFFSET_HOURS * HOUR,
  );

  return new Date(
    Date.UTC(
      wall.getUTCFullYear(),
      wall.getUTCMonth(),
      wall.getUTCDate(),
    ),
  );
}

// Monday of the week after the current business week
export function nextWeekStart(now = new Date()) {
  const today = businessToday(now);
  const daysSinceMonday = (today.getUTCDay() + 6) % 7;

  return addDays(today, 7 - daysSinceMonday);
}

// Instant at a Lagos wall-clock hour on the day `daysBefore` the week start
function atBusinessTime(
  weekStart: Date,
  point: { daysBefore: number; hour: number },
) {
  return new Date(
    addDays(weekStart, -point.daysBefore).getTime() +
      (point.hour - BUSINESS_UTC_OFFSET_HOURS) * HOUR,
  );
}

export function weekSchedule(weekStart: Date, now = new Date()) {
  const reminderFrom = atBusinessTime(weekStart, SCHEDULE.reminderFrom);
  const publishDueAt = atBusinessTime(weekStart, SCHEDULE.publishDue);
  const deadline = atBusinessTime(weekStart, SCHEDULE.deadline);
  const hardClose = atBusinessTime(weekStart, SCHEDULE.hardClose);

  return {
    weekStart,
    days: Array.from(
      { length: WORKING_DAYS },
      (_, i) => addDays(weekStart, i),
    ),
    reminderFrom,
    publishDueAt,
    deadline,
    hardClose,
    // Submissions are accepted until the hidden hard close
    isClosed: now >= hardClose,
  };
}

// "YYYY-MM-DD" → UTC-midnight Monday, or 400
export function parseWeekStart(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(date.getTime())
  ) {
    throw new AppError(400, "Invalid week start date.");
  }

  if (date.getUTCDay() !== 1) {
    throw new AppError(400, "Week start must be a Monday.");
  }

  return date;
}

// "YYYY-MM-DD" → UTC-midnight date, or 400
export function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(date.getTime())
  ) {
    throw new AppError(400, `Invalid date: ${value}`);
  }

  return date;
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

// User-facing label, e.g. "Monday 2 Nov"
export function dayLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
