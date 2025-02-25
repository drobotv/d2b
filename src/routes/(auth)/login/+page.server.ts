import { m } from "$lib/i18n";
import { localizeUrl } from "$lib/paraglide/runtime";
import { loginSchema } from "$lib/schemas/auth";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";
import { verifyPasswordHash } from "$lib/server/password";
import { adapter } from "$lib/utils/superform";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";

export const load = async (event) => {
  if (event.locals.user) redirect(302, localizeUrl("/events"));

  return {
    form: await superValidate(adapter(loginSchema))
  };
};

export const actions = {
  default: async (event) => {
    if (event.locals.user) redirect(302, localizeUrl("/events"));

    const form = await superValidate(event, adapter(loginSchema));
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    const existingUser = await db.select().from(userTable).where(eq(userTable.email, form.data.email)).get();
    if (!existingUser) {
      return setError(form, "", m.form_invalid_data());
    }

    const validPassword = await verifyPasswordHash(form.data.password, existingUser?.hashedPassword || "");
    if (!validPassword) {
      return setError(form, "", m.form_invalid_data());
    }

    const token = generateSessionToken();
    const session = await createSession(token, existingUser.id);
    setSessionTokenCookie(event, token, session.expiresAt);

    redirect(302, localizeUrl("/events"));
  }
};
