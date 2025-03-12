import { eventSchema } from "$lib/schemas/event";

import { db } from "$lib/server/db";
import { availabilityTable, bookingTable, eventsTable, locationTable } from "$lib/server/db/schema";
import { emailService } from "$lib/server/email";
import { adapter } from "$lib/utils/superform";
import { fail } from "@sveltejs/kit";
import { and, asc, eq, lte } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";

export async function load({ locals, depends, url }) {
  depends("load:bookings");

  // Get status filter from URL query params
  const status = url.searchParams.get("status") || "all";

  // Execute query with conditional where clause
  await db.transaction(async (tx) => {
    await tx
      .update(bookingTable)
      .set({ status: "completed" })
      .where(and(eq(bookingTable.status, "confirmed"), lte(bookingTable.endTime, new Date())));

    await tx
      .update(bookingTable)
      .set({ status: "cancelled" })
      .where(and(eq(bookingTable.status, "pending"), lte(bookingTable.startTime, new Date())));
  });

  const bookings = await db
    .select()
    .from(bookingTable)
    .where(
      status !== "all"
        ? and(eq(bookingTable.userId, locals.user!.id), eq(bookingTable.status, status))
        : eq(bookingTable.userId, locals.user!.id)
    )
    .orderBy(asc(bookingTable.startTime));

  return {
    bookings,
    status
  };
}

export const actions = {
  cancel: async ({ request, locals }) => {
    const form = await request.formData();
    const bookingId = form.get("bookingId")?.toString();
    const message = form.get("message")?.toString() || ""; // optional message

    if (!bookingId) {
      return fail(400, { message: "Booking ID is required" });
    }

    // Get the booking to check its status
    const booking = await db
      .select()
      .from(bookingTable)
      .where(and(eq(bookingTable.id, bookingId), eq(bookingTable.userId, locals.user!.id)))
      .get();

    if (!booking) {
      return fail(404, { message: "Booking not found" });
    }

    // Check if booking can be cancelled (not already cancelled or completed)
    if (booking.status === "cancelled" || booking.status === "completed") {
      return fail(400, { message: "Cannot cancel a booking that is already cancelled or completed" });
    }

    // Update booking status to cancelled
    await db
      .update(bookingTable)
      .set({
        status: "cancelled",
        updatedAt: new Date()
      })
      .where(eq(bookingTable.id, bookingId));

    // Send cancellation email to the guest
    try {
      // Get event details
      const [event] = await db
        .select({
          title: eventsTable.title,
          type: eventsTable.type
        })
        .from(eventsTable)
        .where(eq(eventsTable.id, booking.eventTypeId));

      // Get availability for timezone
      const [availability] = await db
        .select({
          timeZone: availabilityTable.timeZone
        })
        .from(availabilityTable)
        .where(eq(availabilityTable.userId, locals.user!.id));

      // Format date and time for email
      const bookingDate = new Date(booking.startTime).toLocaleDateString("en-US", {
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

      const startTimeFormatted = formatTime(new Date(booking.startTime));
      const endTimeFormatted = formatTime(new Date(booking.endTime));

      // Create rebook URL
      const rebookUrl = `/${locals.user!.username}/${event.type}`;

      // Send cancellation email
      await emailService.sendCancellationEmail(booking.guestEmail, {
        eventTitle: event.title,
        hostName: `${locals.user!.firstName || ""} ${locals.user!.lastName || ""}`.trim() || locals.user!.username,
        bookingDate,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        timeZone: availability.timeZone,
        guestName: booking.guestName,
        cancellationMessage: message,
        rebookUrl
      });
    } catch (err) {
      console.error("Error sending cancellation email:", err);
      // Continue with the cancellation even if email fails
    }

    return { success: true };
  },

  confirm: async ({ request, locals }) => {
    const form = await request.formData();
    const bookingId = form.get("bookingId")?.toString();

    if (!bookingId) {
      return fail(400, { message: "Booking ID is required" });
    }

    // Get the booking to check its status
    const booking = await db
      .select()
      .from(bookingTable)
      .where(and(eq(bookingTable.id, bookingId), eq(bookingTable.userId, locals.user!.id)))
      .get();

    if (!booking) {
      return fail(404, { message: "Booking not found" });
    }

    // Check if booking can be confirmed (only if pending)
    if (booking.status !== "pending") {
      return fail(400, { message: "Only pending bookings can be confirmed" });
    }

    // Update booking status to confirmed
    await db
      .update(bookingTable)
      .set({
        status: "confirmed",
        updatedAt: new Date()
      })
      .where(eq(bookingTable.id, bookingId));

    // Send confirmation email to the guest
    try {
      // Get event details
      const [event] = await db
        .select({
          title: eventsTable.title
        })
        .from(eventsTable)
        .where(eq(eventsTable.id, booking.eventTypeId));

      // Get location information
      const [location] = await db
        .select({
          name: locationTable.name,
          address: locationTable.address
        })
        .from(locationTable)
        .where(eq(locationTable.userId, locals.user!.id));

      // Get availability for timezone
      const [availability] = await db
        .select({
          timeZone: availabilityTable.timeZone
        })
        .from(availabilityTable)
        .where(eq(availabilityTable.userId, locals.user!.id));

      // Format date and time for email
      const bookingDate = new Date(booking.startTime).toLocaleDateString("en-US", {
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

      const startTimeFormatted = formatTime(new Date(booking.startTime));
      const endTimeFormatted = formatTime(new Date(booking.endTime));

      // Send confirmation email
      await emailService.sendConfirmationEmail(booking.guestEmail, {
        eventTitle: event.title,
        hostName: `${locals.user!.firstName || ""} ${locals.user!.lastName || ""}`.trim() || locals.user!.username,
        bookingDate,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        timeZone: availability.timeZone,
        guestName: booking.guestName,
        location: {
          name: location.name,
          address: location.address
        }
      });
    } catch (err) {
      console.error("Error sending confirmation email:", err);
      // Continue with the confirmation even if email fails
    }

    return { success: true };
  }
};
