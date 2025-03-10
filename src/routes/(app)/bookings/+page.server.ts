import { eventSchema } from "$lib/schemas/event";

import { db } from "$lib/server/db";
import { bookingTable, eventsTable } from "$lib/server/db/schema";
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

    // TODO: Send email notification with message if email integration is set up

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

    // TODO: Send confirmation email if email integration is set up

    return { success: true };
  }
};
