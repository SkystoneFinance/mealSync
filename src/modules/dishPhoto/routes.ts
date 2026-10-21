import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { AppError } from "../../utils/error";

import { DishPhotoService, MAX_PHOTO_BYTES } from "./service";

const service = new DishPhotoService();

// =========================================
// PUBLIC: /api/v1/dish-photos/:id/image
// Loaded by <img> tags, which can't send a login token. Food photos
// aren't sensitive; ids are unguessable UUIDs.
// =========================================

export async function dishPhotoRoutes(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    "/:id/image",
    async (request, reply) => {
      const photo = await service.getImage(request.params.id);

      return reply
        .header("Content-Type", photo.mimeType)
        // The URL carries a version, so it can be cached for good
        .header("Cache-Control", "public, max-age=31536000, immutable")
        .send(Buffer.from(photo.data));
    },
  );
}

// =========================================
// CHEF / ADMIN: under /api/v1/food-options
// =========================================

export async function dishPhotoAdminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", authorize("ADMIN", "SUPER_ADMIN"));

  // Today's dishes needing photos + transition progress
  app.get("/photo-status", async (_request, reply) => {
    const data = await service.status();
    return reply.send({ success: true, data });
  });

  // Multipart field "photo"
  app.post<{ Params: { id: string } }>(
    "/:id/photo",
    async (request, reply) => {
      const file = await request.file({
        limits: { fileSize: MAX_PHOTO_BYTES },
      });

      if (!file) {
        throw new AppError(400, "Choose a photo to upload.");
      }

      const data = await service.upload(
        request.params.id,
        {
          mimetype: file.mimetype,
          buffer: await file.toBuffer(),
        },
        request.user.id,
      );

      return reply.send({
        success: true,
        message: "Photo saved. It will be used every time this dish is on the menu.",
        data,
      });
    },
  );
}
