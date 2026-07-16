  import { v4 as uuid } from "uuid";
  import QRCode from "qrcode";

  import { AppError } from "../../utils/error";
  import { StaffRepository } from "./repository";
  import type { CreateStaffDto, UpdateStaffDto } from "./types";

  export class StaffService {
    private readonly repository = new StaffRepository();

    async create(data: CreateStaffDto) {
      const existing = await this.repository.findByStaffNumber(
        data.staffNumber,
      );

      if (existing) {
        throw new AppError(409, "Staff number already exists.");
      }

      const qrCodeId = uuid();

      const staff = await this.repository.create({
        ...data,
        qrCodeId,
      });

      const qrImage = await QRCode.toDataURL(qrCodeId);

      return {
        staff,
        qrImage,
      };
    }

    async getAll() {
      return this.repository.findAll();
    }

    async getById(id: string) {
      const staff = await this.repository.findById(id);

      if (!staff) {
        throw new AppError(404, "Staff not found.");
      }

      return staff;
    }

    async update(id: string, data: UpdateStaffDto) {
      const staff = await this.repository.findById(id);

      if (!staff) {
        throw new AppError(404, "Staff not found.");
      }

      return this.repository.update(id, data);
    }

    async delete(id: string) {
      const staff = await this.repository.findById(id);

      if (!staff) {
        throw new AppError(404, "Staff not found.");
      }

      return this.repository.delete(id);
    }
  }