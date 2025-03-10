import { bookingSchema } from "$lib/schemas/booking";
import { db } from "$lib/server/db";
import { availabilityTable, bookingTable, eventsTable } from "$lib/server/db/schema";
import { adapter } from "$lib/utils/superform";
import { generateTimeSlotsForDateRange } from "$lib/utils/timeSlots";
import { error, fail } from "@sveltejs/kit";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";

export async function load({ params }) {
  const { username, event_type } = params;

  // Find the event
  const [event] = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.isActive, true), eq(eventsTable.userName, username), eq(eventsTable.type, event_type)));

  if (!event) {
    return error(404, { message: "Event not found" });
  }

  // Get user's availability
  const [availability] = await db.select().from(availabilityTable).where(eq(availabilityTable.userId, event.userId));

  if (!availability) {
    return error(404, { message: "User availability not found" });
  }

  // Get existing bookings for this event
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Math.floor(today.getTime() / 1000);

  const existingBookings = await db
    .select({
      start: bookingTable.startTime,
      end: bookingTable.endTime
    })
    .from(bookingTable)
    .where(and(gte(bookingTable.startTime, sql`${todayTimestamp}`)));

  // Generate time slots for the next 30 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const timeSlots = generateTimeSlotsForDateRange(startDate, endDate, event, availability, existingBookings);

  console.log("timeSlots", timeSlots["2025-03-11"]);
  console.log("existingBookings", existingBookings);
  console.log("availability", availability);
  console.log("event", event);

  // Create booking form
  const form = await superValidate(adapter(bookingSchema));

  return {
    username,
    event_type,
    event,
    availability,
    timeSlots,
    form
  };
}

export const actions = {
  createBooking: async ({ request, params }) => {
    const { username, event_type } = params;

    // Validate form data
    const form = await superValidate(request, adapter(bookingSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    // Find the event
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(and(eq(eventsTable.isActive, true), eq(eventsTable.userName, username), eq(eventsTable.type, event_type)));

    if (!event) {
      return fail(404, { form, error: "Event not found" });
    }

    try {
      // Parse the start time
      const startTime = new Date(form.data.startTime);
      const endTime = new Date(startTime.getTime() + event.duration * 60000);

      // Create the booking with Date objects
      const [booking] = await db
        .insert(bookingTable)
        .values({
          eventTypeId: event.id,
          eventName: event.title,
          userId: event.userId,
          guestEmail: form.data.guestEmail,
          guestName: form.data.guestName,
          notes: form.data.notes,
          startTime, // Use Date object directly
          endTime, // Use Date object directly
          bufferTime: event.bufferTime,
          status: event.requiresConfirmation ? "pending" : "confirmed"
        })
        .returning();

      return {
        form,
        success: true,
        booking, // No need to convert timestamps
        event
      };
    } catch (err) {
      console.error("Error creating booking:", err);
      return fail(500, {
        form,
        error: "Failed to create booking. Please try again."
      });
    }
  }
};
