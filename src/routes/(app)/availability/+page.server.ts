import { i18n } from "$lib/i18n";
import { availabilitySchema } from "$lib/schemas/availability";
import { adapter } from "$lib/utils/superform";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";

const defaultAvailability = {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  availability: {
    "0": { start: 540, end: 1020, enabled: true },
    "1": { start: 540, end: 1020, enabled: true },
    "2": { start: 540, end: 1020, enabled: true },
    "3": { start: 540, end: 1020, enabled: true },
    "4": { start: 540, end: 1020, enabled: true },
    "5": { start: 540, end: 1020, enabled: false },
    "6": { start: 540, end: 1020, enabled: false }
  }
};

export const load = async () => {
  const form = await superValidate(defaultAvailability, adapter(availabilitySchema));
  return { form };
};

export const actions = {
  default: async (event) => {
    const form = await superValidate(event, adapter(availabilitySchema));

    console.log(form.data.availability);
    console.log(form.data.timeZone);

    if (!form.valid) {
      return fail(400, { form });
    }

    return { form };
  }
};
