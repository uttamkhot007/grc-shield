import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, boolean, pgEnum, text } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const authUserRoleEnum = pgEnum("auth_user_role", ["super_admin", "tenant_admin", "auditor", "end_user"]);
export const authLanguageEnum = pgEnum("auth_language", ["en", "ar", "hi", "zh", "es", "fr", "de", "ja", "ko", "pt"]);

// User storage table for Replit Auth.
// Extended with GRC-specific fields for multi-tenant support.
export const authUsers = pgTable("auth_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: authUserRoleEnum("role").default("end_user"),
  tenantId: varchar("tenant_id"),
  department: text("department"),
  title: text("title"),
  language: authLanguageEnum("language").default("en"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof authUsers.$inferInsert;
export type User = typeof authUsers.$inferSelect;
