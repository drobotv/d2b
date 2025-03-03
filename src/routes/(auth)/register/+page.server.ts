import { m } from "$lib/i18n";
import { localizeUrl } from "$lib/paraglide/runtime";
import { registerSchema } from "$lib/schemas/auth";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";
import { hashPassword } from "$lib/server/password";
import { adapter } from "$lib/utils/superform";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";

export const load = async (event) => {
  if (event.locals.user) redirect(302, localizeUrl("/events"));
  return {
    form: await superValidate(adapter(registerSchema)),
    error: null
  };
};

export const actions = {
  default: async (event) => {
    if (event.locals.user) redirect(302, localizeUrl("/events"));

    const form = await superValidate(event, adapter(registerSchema));
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    const hashedPassword = await hashPassword(form.data.password);
    try {
      const { id } = await db
        .insert(userTable)
        .values({
          username: form.data.username,
          email: form.data.email,
          hashedPassword
        })
        .returning({ id: userTable.id })
        .get();

      const token = generateSessionToken();
      const session = await createSession(token, id);
      setSessionTokenCookie(event, token, session.expiresAt);

      redirect(302, localizeUrl("/events"));
    } catch (error) {
      const errorMessage = String(error);

      if (errorMessage.includes("UNIQUE constraint failed: user.email")) {
        return setError(form, "email", m.email_already_registered());
      } else if (errorMessage.includes("UNIQUE constraint failed: user.username")) {
        return setError(form, "username", m.username_already_taken());
      } else {
        return fail(400, {
          form,
          error: m.registration_failed()
        });
      }
    }
  }
};
