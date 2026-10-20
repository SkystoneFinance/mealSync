import type { Role } from "@prisma/client";

// Sliding session: a token lives this long, and the frontend swaps it for a
// fresh one via POST /auth/refresh while the user keeps using the app.
export const SESSION_TTL = "90d";

export function adminTokenPayload(user: {
  id: string;
  email: string | null;
  role: Role;
}) {
  return {
    id: user.id,
    email: user.email ?? undefined,
    role: user.role,
  };
}

export function staffTokenPayload(staff: {
  id: string;
  staffNumber: string;
  firstName: string;
  lastName: string;
}) {
  return {
    id: staff.id,
    staffId: staff.id,
    role: "USER",
    staffNumber: staff.staffNumber,
    firstName: staff.firstName,
    lastName: staff.lastName,
  };
}
