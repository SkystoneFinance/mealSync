// import { prisma } from "../../config/prisma";

// export class StaffRepository {
//   create(data: {
//     fullName: string;
//     staffId: string;
//     department: string;
//     qrCode: string;
//   }) {
//     return prisma.staff.create({
//       data,
//     });
//   }

//   findAll() {
//     return prisma.staff.findMany({
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//   }

//   findById(id: string) {
//     return prisma.staff.findUnique({
//       where: { id },
//     });
//   }

//   findByStaffId(staffId: string) {
//     return prisma.staff.findUnique({
//       where: { staffId },
//     });
//   }

//   update(id: string, data: object) {
//     return prisma.staff.update({
//       where: { id },
//       data,
//     });
//   }

//   delete(id: string) {
//     return prisma.staff.delete({
//       where: { id },
//     });
//   }
// }