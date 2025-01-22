import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdAt = integer({ mode: "timestamp" })
  .$defaultFn(() => new Date())
  .notNull();
const updatedAt = integer({ mode: "timestamp" }).$onUpdateFn(() => new Date());

export const userTable = sqliteTable("user", {
  id: text().primaryKey(),
  firstName: text().default("").notNull(),
  lastName: text().default("").notNull(),
  email: text().notNull(),
  githubId: text(),
  hashedPassword: text(),
  createdAt,
  updatedAt
});

export const sessionTable = sqliteTable("session", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer({ mode: "timestamp" }).notNull()
});

export type Session = typeof sessionTable.$inferSelect;
export type User = typeof userTable.$inferSelect;
