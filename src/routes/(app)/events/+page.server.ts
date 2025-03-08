import { eventSchema } from "$lib/schemas/event";

import { db } from "$lib/server/db";
import { eventsTable } from "$lib/server/db/schema";
import { adapter } from "$lib/utils/superform";
import { fail, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";

export async function load({ locals, depends }) {
  depends("load:events");

  const events = await db.select().from(eventsTable).where(eq(eventsTable.userId, locals.user!.id));
  const form = await superValidate(adapter(eventSchema));

  return { events, form };
}

export const actions = {
  createOrUpdate: async ({ request, locals }) => {
    const form = await superValidate(request, adapter(eventSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const { id, ...eventData } = form.data;

      if (id) {
        await db
          .update(eventsTable)
          .set({
            ...eventData,
            isActive: eventData.isActive
          })
          .where(eq(eventsTable.id, id));
        return { form, success: true };
      } else {
        await db.insert(eventsTable).values({
          ...eventData,
          userId: locals.user!.id,
          userName: locals.user!.username,
          isActive: eventData.isActive
        });
        return { form, success: true };
      }
    } catch (error) {
      console.error(error);
      return setError(form, "Failed to save event");
    }
  },

  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get("id") as string;

    if (!id) {
      return { success: false, message: "Event ID is required" };
    }

    try {
      await db.delete(eventsTable).where(and(eq(eventsTable.id, id), eq(eventsTable.userId, locals.user!.id)));
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to delete event" };
    }
  },

  toggleStatus: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get("id") as string;
    const isActive = data.get("isActive") === "true";

    if (!id) {
      return { success: false, message: "Event ID is required" };
    }

    try {
      await db
        .update(eventsTable)
        .set({ isActive })
        .where(and(eq(eventsTable.id, id), eq(eventsTable.userId, locals.user!.id)));
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to update event status" };
    }
  }
};
