export const DEFAULT_FRONTEND_HOSTNAME = "https://[YourClassMosaicInstance]";
export const DEFAULT_ADMIN_EMAIL = "admin@example.com";
export const DEFAULT_ADMIN_USERNAME = "Admin";

export function getAdminConfig(): { email: string; username: string } {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminUsername = process.env.SEED_ADMIN_USERNAME;

  if (!adminEmail || !adminUsername) {
    return { email: DEFAULT_ADMIN_EMAIL, username: DEFAULT_ADMIN_USERNAME };
  }

  return { email: adminEmail, username: adminUsername };
}
