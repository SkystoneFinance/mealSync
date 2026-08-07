import { v4 as uuid } from "uuid";
import QRCode from "qrcode";

import ExcelJS from "exceljs";
import type { MultipartFile } from "@fastify/multipart";

import { AppError } from "../../utils/error";
import { StaffRepository } from "./repository";
import type {
  CreateStaffDto,
  UpdateStaffDto,
} from "./types";

export class StaffService {
  private readonly repository = new StaffRepository();

  async create(data: CreateStaffDto) {
    const existing =
      await this.repository.findByStaffNumber(
        data.staffNumber,
      );

    if (existing) {
      throw new AppError(
        409,
        "Staff number already exists.",
      );
    }

    const qrCodeId = uuid();

    const qrImage =
      await QRCode.toDataURL(qrCodeId);

    const staff =
      await this.repository.create({
        ...data,
        qrCodeId,
        qrImage,
      });

    return {
      staff,
      qrImage,
    };
  }

  async getAll() {
    return this.repository.findAll();
  }

  async getById(id: string) {
    const staff =
      await this.repository.findById(id);

    if (!staff) {
      throw new AppError(
        404,
        "Staff not found.",
      );
    }

    return staff;
  }

  async update(
    id: string,
    data: UpdateStaffDto,
  ) {
    const staff =
      await this.repository.findById(id);

    if (!staff) {
      throw new AppError(
        404,
        "Staff not found.",
      );
    }

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const staff =
      await this.repository.findById(id);

    if (!staff) {
      throw new AppError(
        404,
        "Staff not found.",
      );
    }

    return this.repository.delete(id);
  }

  async importStaff(file: MultipartFile) {

    const workbook =
      new ExcelJS.Workbook();

    // TypeScript-compatible fix
    const buffer = await file.toBuffer();

    await workbook.xlsx.load(buffer as any);

    const worksheet =
      workbook.getWorksheet(1);

    if (!worksheet) {
      throw new AppError(
        400,
        "Excel worksheet not found.",
      );
    }

    let imported = 0;
    let skipped = 0;

    const rows =
      worksheet.getRows(
        2,
        Math.max(0, worksheet.rowCount - 1)
      ) ?? [];

    for (const row of rows) {

      const staffNumber = String(
        row.getCell(1).value ?? ""
      ).trim();

      const firstName = String(
        row.getCell(2).value ?? ""
      ).trim();

      const lastName = String(
        row.getCell(3).value ?? ""
      ).trim();

      const department = String(
        row.getCell(4).value ?? ""
      ).trim();

      if (
        !staffNumber ||
        !firstName ||
        !lastName ||
        !department
      ) {
        skipped++;
        continue;
      }

      const existing =
        await this.repository.findByStaffNumber(
          staffNumber,
        );

      if (existing) {
        skipped++;
        continue;
      }

      const qrCodeId = uuid();

      const qrImage =
        await QRCode.toDataURL(qrCodeId);

      await this.repository.create({
        staffNumber,
        firstName,
        lastName,
        department,
        qrCodeId,
        qrImage,
      });

      imported++;
    }

    return {
      imported,
      skipped,
    };
  }

  async getMyProfile(userId: string) {

  const staff =
    await this.repository.findByUserId(userId);

  if (!staff) {

    throw new AppError(
      404,
      "Staff profile not found.",
    );

  }

  return staff;

}
}