import { addDays, startOfDay } from "date-fns";

export function getTodayRange() {
  const today = startOfDay(new Date());

  return {
    gte: today,
    lt: addDays(today, 1),
  };
}