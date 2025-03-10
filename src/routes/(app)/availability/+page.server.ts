import { availabilitySchema } from "$lib/schemas/availability";
import { db } from "$lib/server/db";
import { availabilityTable } from "$lib/server/db/schema";
import { adapter } from "$lib/utils/superform";
import { fail } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import * as v from "valibot";

type AvailabilityFormData = v.InferOutput<typeof availabilitySchema>;

export const load = async ({ locals }) => {
  const existingSchedule = await db
    .select({
      timeZone: availabilityTable.timeZone,
      weeklySchedule: availabilityTable.weeklySchedule
    })
    .from(availabilityTable)
    .where(eq(availabilityTable.userId, locals.user!.id))
    .get();

  if (existingSchedule) {
    return { form: await superValidate(existingSchedule as AvailabilityFormData, adapter(availabilitySchema)) };
  }

  return { form: await superValidate(adapter(availabilitySchema)) };
};

export const actions = {
  default: async ({ locals, request }) => {
    const form = await superValidate(request, adapter(availabilitySchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const result = await db
        .update(availabilityTable)
        .set({
          timeZone: form.data.timeZone,
          weeklySchedule: form.data.weeklySchedule
        })
        .where(eq(availabilityTable.userId, locals.user!.id))
        .returning({ id: availabilityTable.id })
        .get();

      if (!result) {
        await db.insert(availabilityTable).values({
          userId: locals.user!.id,
          timeZone: form.data.timeZone,
          weeklySchedule: form.data.weeklySchedule
        });
      }

      return { form };
    } catch (error) {
      return fail(500, { form });
    }
  }
};
