import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import ExcelJS from "exceljs";

import { prisma } from "../../config/prisma";

export class ReportRepository {
  async getTodaySummary() {
    const today = new Date();

    const totalStaff = await prisma.staff.count({
      where: {
        isActive: true,
      },
    });

    const served = await prisma.attendance.count({
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
      remaining: totalStaff - served,
      attendanceRate:
        totalStaff === 0
          ? 0
          : Number(((served / totalStaff) * 100).toFixed(2)),
    };
  }

  async getWeeklySummary() {
    const today = new Date();

    const totalStaff = await prisma.staff.count({
      where: {
        isActive: true,
      },
    });

    const served = await prisma.attendance.count({
      where: {
        mealDate: {
          gte: startOfWeek(today),
          lte: endOfWeek(today),
        },
      },
    });

    return {
      totalStaff,
      served,
      remaining: totalStaff - served,
      attendanceRate:
        totalStaff === 0
          ? 0
          : Number(((served / totalStaff) * 100).toFixed(2)),
    };
  }

  async getMonthlySummary() {
    const today = new Date();

    const totalStaff = await prisma.staff.count({
      where: {
        isActive: true,
      },
    });

    const served = await prisma.attendance.count({
      where: {
        mealDate: {
          gte: startOfMonth(today),
          lte: endOfMonth(today),
        },
      },
    });

    return {
      totalStaff,
      served,
      remaining: totalStaff - served,
      attendanceRate:
        totalStaff === 0
          ? 0
          : Number(((served / totalStaff) * 100).toFixed(2)),
    };
  }

  async getDepartmentReport() {
    const departments = await prisma.staff.groupBy({
      by: ["department"],
      _count: {
        department: true,
      },
    });

    return Promise.all(
      departments.map(async (dept) => {
        const served = await prisma.attendance.count({
          where: {
            staff: {
              department: dept.department,
            },
            mealDate: {
              gte: startOfDay(new Date()),
            },
          },
        });

        return {
          department: dept.department,
          totalStaff: dept._count.department,
          served,
          remaining: dept._count.department - served,
        };
      }),
    );
  }

  async getStaffSummary(
  period: "today" | "weekly" | "monthly",
) {

  const today = new Date();

  let from: Date;
  let to: Date;

  switch (period) {

    case "today":
      from = startOfDay(today);
      to = endOfDay(today);
      break;

    case "weekly":
      from = startOfWeek(today);
      to = endOfWeek(today);
      break;

    default:
      from = startOfMonth(today);
      to = endOfMonth(today);

  }

  const staff = await prisma.staff.findMany({

    where:{
      isActive:true
    },

    include:{
      attendances:{
        where:{
          mealDate:{
            gte:from,
            lte:to
          }
        },

        orderBy:{
          mealDate:"desc"
        }

      }
    }

  });

  return staff.map((person)=>({

    staffId:person.id,

    staffNumber:person.staffNumber,

    name:`${person.firstName} ${person.lastName}`,

    department:person.department,

    mealCount:person.attendances.length,

    lastMeal:

      person.attendances.length

      ? person.attendances[0].mealDate

      : null

  }));

}

async exportReport(
 period:
 "today" |
 "weekly" |
 "monthly"
){


const data =
await this.getStaffSummary(period);



const workbook =
new ExcelJS.Workbook();



const sheet =
workbook.addWorksheet(
"Meal Report"
);



sheet.columns = [

{
header:"Staff Number",
key:"staffNumber",
width:20
},

{
header:"Name",
key:"name",
width:25
},

{
header:"Department",
key:"department",
width:20
},

{
header:"Meals Taken",
key:"mealCount",
width:15
},

{
header:"Last Meal",
key:"lastMeal",
width:25
}

];



data.forEach((person)=>{

sheet.addRow(person);

});



return workbook.xlsx.writeBuffer();

}
  
}