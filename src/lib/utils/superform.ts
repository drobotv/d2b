import { getLocale } from "$lib/paraglide/runtime";
import { superForm as skSuperform, type FormOptions, type SuperValidated } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import type { GenericSchema, GenericSchemaAsync } from "valibot";

import "@valibot/i18n/pl";

export function superForm<
  T extends Record<string, unknown> = Record<string, unknown>,
  M = any extends never ? any : any,
  In extends Record<string, unknown> = T
>(form: SuperValidated<T, M, In> | T, formOptions?: FormOptions<T, M, In>) {
  // TODO: add generic toast notifications
  return skSuperform(form, formOptions);
}

export function adapter<T extends GenericSchema | GenericSchemaAsync>(schema: T) {
  return valibot(schema, {
    config: {
      lang: getLocale()
    }
  });
}
