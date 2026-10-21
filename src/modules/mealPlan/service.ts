import ExcelJS from "exceljs";

import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/error";

import {
  currentWeekStart,
  dayLabel,
  isPlanningWeek,
  nextWeekStart,
  parseWeekStart,
  planningWeeks,
  toDateKey,
  weekSchedule,
} from "./schedule";

import type { DaySelectionInput } from "./schema";

const staffSelect = {
  id: true,
  staffNumber: true,
  firstName: true,
  lastName: true,
  department: true,
} as const;

// A submission edited more than a minute after it was first made
const EDIT_THRESHOLD_MS = 60 * 1000;

type LegacySelection = {
  staffId: string;
  createdAt: Date;
  updatedAt: Date;
  staff: {
    id: string;
    staffNumber: string;
    firstName: string;
    lastName: string;
    department: string;
  };
};

export class MealPlanService {
  // First and last selection per staff member in a legacy week
  private legacySubmissions(selections: LegacySelection[]) {
    const byStaff = new Map<
      string,
      {
        staff: LegacySelection["staff"];
        submittedAt: Date;
        updatedAt: Date;
      }
    >();

    for (const s of selections) {
      const entry = byStaff.get(s.staffId);

      if (!entry) {
        byStaff.set(s.staffId, {
          staff: s.staff,
          submittedAt: s.createdAt,
          updatedAt: s.updatedAt,
        });
        continue;
      }

      if (s.createdAt < entry.submittedAt) entry.submittedAt = s.createdAt;
      if (s.updatedAt > entry.updatedAt) entry.updatedAt = s.updatedAt;
    }

    return [...byStaff.values()].sort(
      (a, b) => a.submittedAt.getTime() - b.submittedAt.getTime(),
    );
  }

  // =========================================
  // SHARED
  // =========================================

  private findWeek(weekStart: Date) {
    return prisma.menuWeek.findUnique({
      where: { weekStart },
    });
  }

  private async findOrCreateWeek(weekStart: Date) {
    return prisma.menuWeek.upsert({
      where: { weekStart },
      update: {},
      create: { weekStart },
    });
  }

  private isClosedDay(
    closedDates: Date[],
    day: Date,
  ) {
    return closedDates.some(
      (d) => d.getTime() === day.getTime(),
    );
  }

  private activeOptionsForWeek(days: Date[]) {
    return prisma.foodOption.findMany({
      where: {
        mealDate: { in: days },
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // =========================================
  // STAFF: A WEEK'S PLAN (any week; editable only while open)
  // =========================================

  async getStaffPlan(
    staffId: string,
    weekStart: Date = nextWeekStart(),
  ) {
    const now = new Date();
    const schedule = weekSchedule(weekStart, now);
    const week = await this.findWeek(weekStart);

    const isPublished = Boolean(week?.publishedAt);
    const isOpen =
      isPublished &&
      !schedule.isClosed &&
      isPlanningWeek(weekStart, now);

    // Weeks before weekly planning existed (or never published) still
    // have per-day selections; show them read-only.
    const isLegacy = !isPublished;

    const closedDates = week?.closedDates ?? [];

    const [options, selections, submission] =
      await Promise.all([
        // The menu is only revealed while the week is open for choosing
        isOpen
          ? this.activeOptionsForWeek(schedule.days)
          : Promise.resolve([]),

        prisma.mealSelection.findMany({
          where: {
            staffId,
            mealDate: { in: schedule.days },
          },
          include: { foodOption: true },
        }),

        week
          ? prisma.weeklySubmission.findUnique({
              where: {
                staffId_menuWeekId: {
                  staffId,
                  menuWeekId: week.id,
                },
              },
            })
          : Promise.resolve(null),
      ]);

    // In a published week only a submitted plan counts
    const visibleSelections =
      submission || isLegacy ? selections : [];

    return {
      week: {
        weekStart: toDateKey(weekStart),
        deadline: schedule.deadline,
        isPublished,
        isOpen,
        isLegacy,
        isPlanningWeek: isPlanningWeek(weekStart, now),
        isCurrentWeek:
          weekStart.getTime() === currentWeekStart(now).getTime(),
      },

      days: schedule.days.map((day) => ({
        date: toDateKey(day),
        closed: this.isClosedDay(closedDates, day),
        options: options
          .filter(
            (o) => o.mealDate.getTime() === day.getTime(),
          )
          .map((o) => ({
            id: o.id,
            name: o.name,
            image: o.image,
          })),
      })),

      selections: visibleSelections.map((s) => ({
        date: toDateKey(s.mealDate),
        foodOptionId: s.foodOptionId,
        noMeal: s.noMeal,
        // For read-only display of past choices
        dish: s.foodOption
          ? { name: s.foodOption.name, image: s.foodOption.image }
          : null,
      })),

      submission: submission
        ? {
            submittedAt: submission.submittedAt,
            updatedAt: submission.updatedAt,
          }
        : null,
    };
  }

  // Next week and the week after: published? open? submitted?
  async getStaffStatus(staffId: string) {
    const now = new Date();
    const weekStarts = planningWeeks(now);

    const weeks = await prisma.menuWeek.findMany({
      where: { weekStart: { in: weekStarts } },
      include: {
        submissions: {
          where: { staffId },
          select: { submittedAt: true },
        },
      },
    });

    return weekStarts.map((weekStart) => {
      const schedule = weekSchedule(weekStart, now);
      const week = weeks.find(
        (w) => w.weekStart.getTime() === weekStart.getTime(),
      );
      const isPublished = Boolean(week?.publishedAt);

      return {
        weekStart: toDateKey(weekStart),
        deadline: schedule.deadline,
        isPublished,
        isOpen: isPublished && !schedule.isClosed,
        submittedAt: week?.submissions[0]?.submittedAt ?? null,
      };
    });
  }

  async submitStaffPlan(
    staffId: string,
    weekStartKey: string,
    input: DaySelectionInput[],
  ) {
    const weekStart = parseWeekStart(weekStartKey);

    if (!isPlanningWeek(weekStart)) {
      throw new AppError(
        409,
        "Meal selection is closed for this week.",
      );
    }

    const schedule = weekSchedule(weekStart);
    const week = await this.findWeek(weekStart);

    if (!week?.publishedAt) {
      throw new AppError(
        409,
        "The menu for this week has not been published yet.",
      );
    }

    // The hidden hard close (Thursday 19:00), not the displayed deadline
    if (schedule.isClosed) {
      throw new AppError(
        409,
        "Meal selection for this week has closed.",
      );
    }

    const openDays = schedule.days.filter(
      (day) => !this.isClosedDay(week.closedDates, day),
    );

    const byDate = new Map(
      input.map((s) => [s.date, s]),
    );

    if (byDate.size !== input.length) {
      throw new AppError(400, "Each day may only appear once.");
    }

    const options = await this.activeOptionsForWeek(openDays);

    const rows = openDays.map((day) => {
      const key = toDateKey(day);
      const choice = byDate.get(key);

      if (!choice) {
        throw new AppError(
          400,
          `Please choose a meal or "No meal required" for ${dayLabel(day)}.`,
        );
      }

      if (choice.noMeal) {
        return { mealDate: day, foodOptionId: null, noMeal: true };
      }

      const option = options.find(
        (o) =>
          o.id === choice.foodOptionId &&
          o.mealDate.getTime() === day.getTime(),
      );

      if (!option) {
        throw new AppError(
          400,
          `That meal is not available on ${dayLabel(day)}.`,
        );
      }

      return { mealDate: day, foodOptionId: option.id, noMeal: false };
    });

    const extra = input.filter(
      (s) => !openDays.some((d) => toDateKey(d) === s.date),
    );

    if (extra.length) {
      throw new AppError(
        400,
        `${extra[0].date} is not open for selection.`,
      );
    }

    const now = new Date();

    const submission = await prisma.$transaction(async (tx) => {
      // Clear anything for this week (incl. closed days), then write the plan
      await tx.mealSelection.deleteMany({
        where: {
          staffId,
          mealDate: { in: schedule.days },
        },
      });

      await tx.mealSelection.createMany({
        data: rows.map((r) => ({ ...r, staffId })),
      });

      return tx.weeklySubmission.upsert({
        where: {
          staffId_menuWeekId: {
            staffId,
            menuWeekId: week.id,
          },
        },
        create: {
          staffId,
          menuWeekId: week.id,
          submittedAt: now,
        },
        update: {
          updatedAt: now,
        },
      });
    });

    return {
      submittedAt: submission.submittedAt,
      updatedAt: submission.updatedAt,
    };
  }

  // =========================================
  // CHEF: STATUS FOR DASHBOARD BANNERS
  // =========================================

  async getChefStatus() {
    const now = new Date();
    const weekStart = nextWeekStart(now);
    const schedule = weekSchedule(weekStart, now);
    const week = await this.findWeek(weekStart);

    const isPublished = Boolean(week?.publishedAt);

    return {
      weekStart: toDateKey(weekStart),
      publishDueAt: schedule.publishDueAt,
      deadline: schedule.deadline,
      hardClose: schedule.hardClose,
      isPublished,
      publishedAt: week?.publishedAt ?? null,
      // Tuesday onwards until published (and before close)
      showPublishReminder:
        !isPublished &&
        now >= schedule.reminderFrom &&
        !schedule.isClosed,
      isPublishOverdue:
        !isPublished && now >= schedule.publishDueAt,
      isConfirmed: isPublished && schedule.isClosed,
    };
  }

  // =========================================
  // CHEF: PLANNING VIEW FOR A WEEK
  // =========================================

  async getWeek(weekStart: Date) {
    const schedule = weekSchedule(weekStart);
    const week = await this.findWeek(weekStart);
    const closedDates = week?.closedDates ?? [];

    const options = await prisma.foodOption.findMany({
      where: { mealDate: { in: schedule.days } },
      orderBy: { createdAt: "asc" },
    });

    return {
      weekStart: toDateKey(weekStart),
      publishDueAt: schedule.publishDueAt,
      deadline: schedule.deadline,
      hardClose: schedule.hardClose,
      isClosed: schedule.isClosed,
      // Only next week and the week after can be edited/published
      isPlanningWeek: isPlanningWeek(weekStart),
      isPublished: Boolean(week?.publishedAt),
      publishedAt: week?.publishedAt ?? null,
      publishedLate: Boolean(
        week?.publishedAt &&
          week.publishedAt > schedule.publishDueAt,
      ),

      days: schedule.days.map((day) => ({
        date: toDateKey(day),
        closed: this.isClosedDay(closedDates, day),
        options: options
          .filter(
            (o) => o.mealDate.getTime() === day.getTime(),
          )
          .map((o) => ({
            id: o.id,
            name: o.name,
            image: o.image,
            isActive: o.isActive,
          })),
      })),
    };
  }

  async setClosedDays(
    weekStart: Date,
    dateKeys: string[],
  ) {
    if (!isPlanningWeek(weekStart)) {
      throw new AppError(
        409,
        "You can only plan next week or the week after.",
      );
    }

    const schedule = weekSchedule(weekStart);
    const existing = await this.findWeek(weekStart);

    if (existing?.publishedAt) {
      throw new AppError(
        409,
        "Closed days can't be changed after the week is published.",
      );
    }

    const weekKeys = schedule.days.map(toDateKey);
    const invalid = dateKeys.find((k) => !weekKeys.includes(k));

    if (invalid) {
      throw new AppError(
        400,
        `${invalid} is not a weekday in this week.`,
      );
    }

    const week = await this.findOrCreateWeek(weekStart);

    await prisma.menuWeek.update({
      where: { id: week.id },
      data: {
        closedDates: schedule.days.filter((d) =>
          dateKeys.includes(toDateKey(d)),
        ),
      },
    });

    return this.getWeek(weekStart);
  }

  async publish(weekStart: Date, userId: string) {
    if (!isPlanningWeek(weekStart)) {
      throw new AppError(
        409,
        "You can only plan next week or the week after.",
      );
    }

    const schedule = weekSchedule(weekStart);

    if (schedule.isClosed) {
      throw new AppError(
        409,
        "Selection for this week has already closed.",
      );
    }

    const week = await this.findOrCreateWeek(weekStart);

    if (week.publishedAt) {
      throw new AppError(409, "This week is already published.");
    }

    const openDays = schedule.days.filter(
      (day) => !this.isClosedDay(week.closedDates, day),
    );

    if (!openDays.length) {
      throw new AppError(
        400,
        "Every day is marked closed; there is nothing to publish.",
      );
    }

    const options = await this.activeOptionsForWeek(openDays);

    const emptyDay = openDays.find(
      (day) =>
        !options.some(
          (o) => o.mealDate.getTime() === day.getTime(),
        ),
    );

    if (emptyDay) {
      throw new AppError(
        400,
        `Add at least one active meal for ${dayLabel(emptyDay)}, or mark it closed.`,
      );
    }

    await prisma.menuWeek.update({
      where: { id: week.id },
      data: {
        publishedAt: new Date(),
        publishedById: userId,
      },
    });

    return this.getWeek(weekStart);
  }

  // =========================================
  // CHEF: MEAL PREPARATION SUMMARY
  // =========================================

  async getSummary(weekStart: Date) {
    const schedule = weekSchedule(weekStart);
    const week = await this.findWeek(weekStart);
    const closedDates = week?.closedDates ?? [];
    const isPublished = Boolean(week?.publishedAt);

    const [activeStaff, submissions, options] =
      await Promise.all([
        prisma.staff.findMany({
          where: { isActive: true },
          select: {
            ...staffSelect,
            user: { select: { password: true } },
          },
          orderBy: [
            { department: "asc" },
            { lastName: "asc" },
          ],
        }),

        week && isPublished
          ? prisma.weeklySubmission.findMany({
              where: {
                menuWeekId: week.id,
                staff: { isActive: true },
              },
              include: { staff: { select: staffSelect } },
              orderBy: { submittedAt: "asc" },
            })
          : Promise.resolve([]),

        prisma.foodOption.findMany({
          where: { mealDate: { in: schedule.days } },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    // Published week: only submitted plans count.
    // Legacy week (chosen day by day before weekly planning): every
    // selection counts, and the first one stands in for the submission.
    const selections = await prisma.mealSelection.findMany({
      where: {
        mealDate: { in: schedule.days },
        staff: { isActive: true },
        ...(isPublished
          ? { staffId: { in: submissions.map((s) => s.staffId) } }
          : {}),
      },
      include: isPublished
        ? undefined
        : { staff: { select: staffSelect } },
    });

    const submitted = isPublished
      ? submissions.map((s) => ({
          staff: s.staff,
          submittedAt: s.submittedAt,
          updatedAt: s.updatedAt,
        }))
      : this.legacySubmissions(
          selections as unknown as LegacySelection[],
        );

    const submitterIds = submitted.map((s) => s.staff.id);

    const notSubmitted = activeStaff.filter(
      (s) => !submitterIds.includes(s.id),
    );

    const days = schedule.days.map((day) => {
      const closed = this.isClosedDay(closedDates, day);

      const daySelections = selections.filter(
        (s) => s.mealDate.getTime() === day.getTime(),
      );

      const dayOptions = options
        .filter((o) => o.mealDate.getTime() === day.getTime())
        .map((o) => ({
          id: o.id,
          name: o.name,
          isActive: o.isActive,
          count: daySelections.filter(
            (s) => s.foodOptionId === o.id,
          ).length,
        }))
        // Hide disabled dishes nobody picked
        .filter((o) => o.isActive || o.count > 0);

      return {
        date: toDateKey(day),
        closed,
        options: dayOptions,
        mealsRequired: closed
          ? 0
          : daySelections.filter((s) => !s.noMeal).length,
        noMeal: closed
          ? 0
          : daySelections.filter((s) => s.noMeal).length,
        notSubmitted: closed ? 0 : notSubmitted.length,
      };
    });

    return {
      weekStart: toDateKey(weekStart),
      deadline: schedule.deadline,
      hardClose: schedule.hardClose,
      isPublished,
      publishedAt: week?.publishedAt ?? null,
      isConfirmed: isPublished && schedule.isClosed,
      // Chosen day by day before weekly planning existed
      isLegacy: !isPublished && selections.length > 0,

      totals: {
        activeStaff: activeStaff.length,
        submitted: submitted.length,
        notSubmitted: notSubmitted.length,
      },

      days,

      submitted: submitted.map((s) => ({
        ...s.staff,
        submittedAt: s.submittedAt,
        updatedAt: s.updatedAt,
        edited:
          s.updatedAt.getTime() - s.submittedAt.getTime() >
          EDIT_THRESHOLD_MS,
      })),

      notSubmitted: notSubmitted.map(({ user, ...s }) => ({
        ...s,
        // Never activated = has no login, so can't submit at all
        hasActivatedAccount: Boolean(user?.password),
      })),
    };
  }

  async exportSummary(weekStart: Date) {
    const summary = await this.getSummary(weekStart);
    const workbook = new ExcelJS.Workbook();

    const dayName = (key: string) =>
      new Date(`${key}T00:00:00.000Z`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });

    const lagosTime = (date: Date) =>
      date.toLocaleString("en-GB", { timeZone: "Africa/Lagos" });

    // Sheet 1: what to cook
    const prep = workbook.addWorksheet("Meal preparation");
    prep.addRow([`Meal Preparation Summary: week of ${dayName(summary.weekStart)}`]).font = { bold: true, size: 14 };
    prep.addRow([
      `Submitted: ${summary.totals.submitted} of ${summary.totals.activeStaff} active staff`,
    ]);
    prep.addRow([
      summary.isConfirmed
        ? "Status: confirmed (selection closed)"
        : "Status: provisional (selection still open)",
    ]);
    prep.addRow([]);

    for (const day of summary.days) {
      prep.addRow([dayName(day.date)]).font = { bold: true };

      if (day.closed) {
        prep.addRow(["Kitchen closed"]);
        prep.addRow([]);
        continue;
      }

      for (const option of day.options) {
        prep.addRow([`  ${option.name}`, option.count]);
      }

      prep.addRow(["  Meals required", day.mealsRequired]).font = { bold: true };
      prep.addRow(['  "No meal required"', day.noMeal]);
      prep.addRow(["  Did not submit", day.notSubmitted]);
      prep.addRow([]);
    }

    prep.getColumn(1).width = 45;
    prep.getColumn(2).width = 12;

    // Sheet 2: who submitted and when
    const submitted = workbook.addWorksheet("Submitted");
    submitted.columns = [
      { header: "Staff number", key: "staffNumber", width: 14 },
      { header: "Name", key: "name", width: 28 },
      { header: "Department", key: "department", width: 24 },
      { header: "Submitted at", key: "submittedAt", width: 22 },
      { header: "Last edited", key: "lastEdited", width: 22 },
    ];
    submitted.getRow(1).font = { bold: true };

    for (const s of summary.submitted) {
      submitted.addRow({
        staffNumber: s.staffNumber,
        name: `${s.firstName} ${s.lastName}`,
        department: s.department,
        submittedAt: lagosTime(s.submittedAt),
        lastEdited: s.edited ? lagosTime(s.updatedAt) : "",
      });
    }

    // Sheet 3: who didn't
    const missing = workbook.addWorksheet("Did not submit");
    missing.columns = [
      { header: "Staff number", key: "staffNumber", width: 14 },
      { header: "Name", key: "name", width: 28 },
      { header: "Department", key: "department", width: 24 },
      { header: "Note", key: "note", width: 28 },
    ];
    missing.getRow(1).font = { bold: true };

    for (const s of summary.notSubmitted) {
      missing.addRow({
        staffNumber: s.staffNumber,
        name: `${s.firstName} ${s.lastName}`,
        department: s.department,
        note: s.hasActivatedAccount ? "" : "Account never activated",
      });
    }

    return workbook.xlsx.writeBuffer();
  }
}
