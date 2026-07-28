import type { AuthSessionUser } from "@/src/features/auth/types";

export const demoAdminCredentials = {
  email: "admin.demo@decoho.vn",
  password: "admin123",
};

export const demoAdminSessionUser: AuthSessionUser = {
  email: demoAdminCredentials.email,
  name: "DECOHO Admin",
  phone: "028 7300 1688",
  registeredAt: "2026-07-01T08:00:00.000Z",
  role: "admin",
};
