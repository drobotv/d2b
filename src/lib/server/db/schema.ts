import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = text().primaryKey().$defaultFn(createId);
const createdAt = integer({ mode: "timestamp" })
  .$defaultFn(() => new Date())
  .notNull();
const updatedAt = integer({ mode: "timestamp" }).$onUpdateFn(() => new Date());

export const userTable = sqliteTable("user", {
  id,
  firstName: text().default(""),
  lastName: text().default(""),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  githubId: text(),
  hashedPassword: text(),
  bio: text().default(""),
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

export const availabilityScheduleTable = sqliteTable("availability_schedule", {
  id,
  userId: text()
    .notNull()
    .references(() => userTable.id)
    .unique(),
  timeZone: text().notNull(),
  weeklySchedule: text({ mode: "json" }).notNull(),
  createdAt,
  updatedAt
});

export const eventsTable = sqliteTable("events", {
  id,
  userId: text()
    .notNull()
    .references(() => userTable.id),
  slug: text().notNull(),
  title: text().notNull(),
  description: text(),
  location: text(),
  duration: integer().notNull(), // in minutes
  bufferTime: integer().default(0).notNull(), // in minutes
  color: text().default("#000000").notNull(),
  isActive: integer().default(1).notNull(), // 0 or 1
  createdAt,
  updatedAt
});

export const bookingTable = sqliteTable("booking", {
  id,
  eventTypeId: text()
    .notNull()
    .references(() => eventsTable.id),
  userId: text()
    .notNull()
    .references(() => userTable.id),
  guestEmail: text().notNull(),
  guestName: text().notNull(),
  startTime: integer({ mode: "timestamp" }).notNull(),
  endTime: integer({ mode: "timestamp" }).notNull(),
  status: text().default("pending").notNull(), // pending, confirmed, cancelled, completed
  notes: text(),
  createdAt,
  updatedAt
});

export type Session = typeof sessionTable.$inferSelect;
export type User = typeof userTable.$inferSelect;
export type AvailabilitySchedule = typeof availabilityScheduleTable.$inferSelect;
export type Event = typeof eventsTable.$inferSelect;
export type Booking = typeof bookingTable.$inferSelect;
