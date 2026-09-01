import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from "date-fns";

import ExcelJS from "exceljs";

import { prisma } from "../../config/prisma";


// ========================================
// EXPORT PERIOD TYPES
// ========================================

type ExportPeriod =
  | "today"
  | "current-week"
  | "previous-week"
  | "current-month"
  | "previous-month";


// ========================================
// REPORT REPOSITORY
// ========================================

export class ReportRepository {


  // ========================================
  // TODAY SUMMARY
  // ========================================

  async getTodaySummary() {

    const today = new Date();


    const totalStaff =
      await prisma.staff.count({

        where: {
          isActive: true,
        },

      });


    const served =
      await prisma.attendance.count({

        where: {

          mealDate: {

            gte: startOfDay(today),

            lte: endOfDay(today),

          },

        },

      });


    return {

      totalStaff,

      served,

      remaining:
        totalStaff - served,

      attendanceRate:

        totalStaff === 0

          ? 0

          : Number(
              (
                (served / totalStaff) *
                100
              ).toFixed(2)
            ),

    };

  }


  // ========================================
  // WEEKLY SUMMARY
  // ========================================

  async getWeeklySummary() {

    const today = new Date();


    const totalStaff =
      await prisma.staff.count({

        where: {
          isActive: true,
        },

      });


    const served =
      await prisma.attendance.count({

        where: {

          mealDate: {

            gte: startOfWeek(
              today,
              {
                weekStartsOn: 1,
              }
            ),

            lte: endOfWeek(
              today,
              {
                weekStartsOn: 1,
              }
            ),

          },

        },

      });


    return {

      totalStaff,

      served,

      remaining:
        totalStaff - served,

      attendanceRate:

        totalStaff === 0

          ? 0

          : Number(
              (
                (served / totalStaff) *
                100
              ).toFixed(2)
            ),

    };

  }


  // ========================================
  // MONTHLY SUMMARY
  // ========================================

  async getMonthlySummary() {

    const today = new Date();


    const totalStaff =
      await prisma.staff.count({

        where: {
          isActive: true,
        },

      });


    const served =
      await prisma.attendance.count({

        where: {

          mealDate: {

            gte:
              startOfMonth(today),

            lte:
              endOfMonth(today),

          },

        },

      });


    return {

      totalStaff,

      served,

      remaining:
        totalStaff - served,

      attendanceRate:

        totalStaff === 0

          ? 0

          : Number(
              (
                (served / totalStaff) *
                100
              ).toFixed(2)
            ),

    };

  }


  // ========================================
  // DEPARTMENT REPORT
  // ========================================

  async getDepartmentReport() {

    const departments =
      await prisma.staff.groupBy({

        by: [
          "department",
        ],

        _count: {

          department: true,

        },

      });


    return Promise.all(

      departments.map(
        async (dept) => {

          const served =
            await prisma.attendance.count({

              where: {

                staff: {

                  department:
                    dept.department,

                },

                mealDate: {

                  gte:
                    startOfDay(
                      new Date()
                    ),

                },

              },

            });


          return {

            department:
              dept.department,

            totalStaff:
              dept._count.department,

            served,

            remaining:
              dept._count.department -
              served,

          };

        }
      )

    );

  }


  // ========================================
  // STAFF SUMMARY
  // ========================================

  async getStaffSummary(
    period:
      | "today"
      | "weekly"
      | "monthly",
  ) {

    const today =
      new Date();


    let from: Date;

    let to: Date;


    switch (period) {

      case "today":

        from =
          startOfDay(today);

        to =
          endOfDay(today);

        break;


      case "weekly":

        from =
          startOfWeek(
            today,
            {
              weekStartsOn: 1,
            }
          );

        to =
          endOfWeek(
            today,
            {
              weekStartsOn: 1,
            }
          );

        break;


      default:

        from =
          startOfMonth(today);

        to =
          endOfMonth(today);

        break;

    }


    const staff =
      await prisma.staff.findMany({

        where: {

          isActive: true,

        },


        include: {

          attendances: {

            where: {

              mealDate: {

                gte: from,

                lte: to,

              },

            },


            orderBy: {

              mealDate:
                "desc",

            },

          },

        },

      });


    return staff.map(
      (person) => ({

        staffId:
          person.id,

        staffNumber:
          person.staffNumber,

        name:
          `${person.firstName} ${person.lastName}`,

        department:
          person.department,

        mealCount:
          person.attendances.length,

        lastMeal:

          person.attendances.length

            ? person.attendances[0]
                .mealDate

            : null,

      })
    );

  }


  // ========================================
  // GET EXPORT DATE RANGE
  // ========================================

  private getExportDateRange(
    period: ExportPeriod,
  ) {

    const today =
      new Date();


    switch (period) {


      // ------------------------------------
      // TODAY
      // ------------------------------------

      case "today":

        return {

          from:
            startOfDay(today),

          to:
            endOfDay(today),

        };


      // ------------------------------------
      // CURRENT WEEK
      // ------------------------------------

      case "current-week": {

        const from =
          startOfWeek(
            today,
            {
              weekStartsOn: 1,
            }
          );


        const to =
          endOfDay(today);


        return {
          from,
          to,
        };

      }


      // ------------------------------------
      // PREVIOUS WEEK
      // ------------------------------------

      case "previous-week": {

        const previousWeek =
          subWeeks(
            today,
            1
          );


        const from =
          startOfWeek(
            previousWeek,
            {
              weekStartsOn: 1,
            }
          );


        const to =
          endOfWeek(
            previousWeek,
            {
              weekStartsOn: 1,
            }
          );


        return {

          from,

          to,

        };

      }


      // ------------------------------------
      // CURRENT MONTH
      // ------------------------------------

      case "current-month": {

        const from =
          startOfMonth(today);


        const to =
          endOfDay(today);


        return {

          from,

          to,

        };

      }


      // ------------------------------------
      // PREVIOUS MONTH
      // ------------------------------------

      case "previous-month": {

        const previousMonth =
          subMonths(
            today,
            1
          );


        const from =
          startOfMonth(
            previousMonth
          );


        const to =
          endOfMonth(
            previousMonth
          );


        return {

          from,

          to,

        };

      }

    }

  }


  // ========================================
  // EXPORT EXCEL REPORT
  // ========================================

  async exportReport(
    period: ExportPeriod,
  ) {


    // ------------------------------------
    // GET DATE RANGE
    // ------------------------------------

    const {
      from,
      to,
    } =
      this.getExportDateRange(
        period
      );


    // ------------------------------------
    // GET ACTIVE STAFF
    // ------------------------------------

    const staff =
      await prisma.staff.findMany({

        where: {

          isActive: true,

        },


        include: {

          attendances: {

            where: {

              mealDate: {

                gte: from,

                lte: to,

              },

            },


            orderBy: {

              mealDate:
                "desc",

            },

          },

        },

        orderBy: {

          staffNumber:
            "asc",

        },

      });


    // ------------------------------------
    // CREATE WORKBOOK
    // ------------------------------------

    const workbook =
      new ExcelJS.Workbook();


    const sheet =
      workbook.addWorksheet(
        "Meal Report"
      );


    // ------------------------------------
    // REPORT INFORMATION
    // ------------------------------------

    sheet.mergeCells(
      "A1:E1"
    );


    sheet.getCell(
      "A1"
    ).value =
      "MealSync Attendance Report";


    sheet.getCell(
      "A1"
    ).font = {

      bold: true,

      size: 16,

    };


    sheet.getCell(
      "A1"
    ).alignment = {

      horizontal:
        "center",

    };


    sheet.mergeCells(
      "A2:E2"
    );


    sheet.getCell(
      "A2"
    ).value =
      `Period: ${period}`;


    sheet.mergeCells(
      "A3:E3"
    );


    sheet.getCell(
      "A3"
    ).value =
      `From: ${from.toLocaleDateString()}  To: ${to.toLocaleDateString()}`;


    // ------------------------------------
    // TABLE HEADER
    // ------------------------------------

    sheet.addRow([]);


    const headerRow =
      sheet.addRow([

        "Staff Number",

        "Name",

        "Department",

        "Meals Taken",

        "Last Meal",

      ]);


    headerRow.font = {

      bold: true,

    };


    // ------------------------------------
    // ADD STAFF DATA
    // ------------------------------------

    staff.forEach(
      (person) => {

        const lastMeal =
          person.attendances.length
            ? person.attendances[0]
                .mealDate
            : null;


        sheet.addRow([

          person.staffNumber,

          `${person.firstName} ${person.lastName}`,

          person.department,

          person.attendances.length,

          lastMeal
            ? lastMeal.toLocaleString()
            : "--",

        ]);

      }
    );


    // ------------------------------------
    // COLUMN WIDTHS
    // ------------------------------------

    sheet.columns = [

      {
        key: "staffNumber",
        width: 20,
      },

      {
        key: "name",
        width: 30,
      },

      {
        key: "department",
        width: 25,
      },

      {
        key: "meals",
        width: 15,
      },

      {
        key: "lastMeal",
        width: 25,
      },

    ];


    // ------------------------------------
    // FREEZE HEADER AREA
    // ------------------------------------

    sheet.views = [

      {
        state: "frozen",

        ySplit: 5,

      },

    ];


    // ------------------------------------
    // RETURN EXCEL FILE
    // ------------------------------------

    return workbook.xlsx.writeBuffer();

  }

}