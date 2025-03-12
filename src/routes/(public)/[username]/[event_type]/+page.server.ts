import { m } from "$lib/i18n";
import { bookingSchema } from "$lib/schemas/booking";
import { db } from "$lib/server/db";
import { availabilityTable, bookingTable, eventsTable, locationTable, userTable } from "$lib/server/db/schema";
import { emailService } from "$lib/server/email";
import { adapter } from "$lib/utils/superform";
import { generateTimeSlotsForDateRange } from "$lib/utils/timeSlots";
import { error, fail } from "@sveltejs/kit";
import { and, eq, gte, sql } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";

export async function load({ params }) {
  const { username, event_type } = params;

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.isActive, true), eq(eventsTable.userName, username), eq(eventsTable.type, event_type)));

  if (!event) {
    return error(404, { message: m.event_not_found() });
  }

  const [availability] = await db.select().from(availabilityTable).where(eq(availabilityTable.userId, event.userId));

  if (!availability) {
    return error(404, { message: m.user_availability_not_found() });
  }

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

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const timeSlots = generateTimeSlotsForDateRange(startDate, endDate, event, availability, existingBookings);

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

    const form = await superValidate(request, adapter(bookingSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(and(eq(eventsTable.isActive, true), eq(eventsTable.userName, username), eq(eventsTable.type, event_type)));

    if (!event) {
      return fail(404, { form, error: m.event_not_found() });
    }

    try {
      const startTime = new Date(form.data.startTime);
      const endTime = new Date(startTime.getTime() + event.duration * 60000);

      const [booking] = await db
        .insert(bookingTable)
        .values({
          eventTypeId: event.id,
          eventName: event.title,
          userId: event.userId,
          guestEmail: form.data.guestEmail,
          guestName: form.data.guestName,
          notes: form.data.notes,
          startTime,
          endTime,
          bufferTime: event.bufferTime,
          status: event.requiresConfirmation ? "pending" : "confirmed"
        })
        .returning();

      const [host] = await db
        .select({
          firstName: userTable.firstName,
          lastName: userTable.lastName,
          email: userTable.email
        })
        .from(userTable)
        .where(eq(userTable.id, event.userId));

      const [location] = await db
        .select({
          name: locationTable.name,
          address: locationTable.address
        })
        .from(locationTable)
        .where(eq(locationTable.userId, event.userId));

      const [availability] = await db
        .select({
          timeZone: availabilityTable.timeZone
        })
        .from(availabilityTable)
        .where(eq(availabilityTable.userId, event.userId));

      const bookingDate = startTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: availability.timeZone
      });

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: availability.timeZone
        });
      };

      const startTimeFormatted = formatTime(startTime);
      const endTimeFormatted = formatTime(endTime);

      const hostName = `${host.firstName} ${host.lastName}`.trim();

      const emailData = {
        eventTitle: event.title,
        hostName,
        bookingDate,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        timeZone: availability.timeZone,
        guestName: form.data.guestName,
        location: {
          name: location.name,
          address: location.address
        }
      };

      if (event.requiresConfirmation) {
        await emailService.sendRequestEmail(form.data.guestEmail, emailData);
      } else {
        await emailService.sendConfirmationEmail(form.data.guestEmail, emailData);
      }

      return {
        form,
        success: true,
        booking,
        event
      };
    } catch (err) {
      console.error("Error creating booking:", err);
      return fail(500, {
        form,
        error: m.booking_creation_failed()
      });
    }
  }
};
