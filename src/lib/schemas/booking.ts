import * as v from "valibot";

export const bookingSchema = v.object({
  eventTypeId: v.string(),
  guestName: v.pipe(
    v.string(),
    v.minLength(2, "Name is required and must be at least 2 characters"),
    v.maxLength(100, "Name cannot exceed 100 characters")
  ),
  guestEmail: v.pipe(v.string(), v.email("Please enter a valid email address")),
  notes: v.optional(v.pipe(v.string(), v.maxLength(1000, "Notes cannot exceed 1000 characters"))),
  startTime: v.string(), // ISO string of the selected time
  date: v.string() // YYYY-MM-DD format
});

export type BookingSchema = v.InferOutput<typeof bookingSchema>;
