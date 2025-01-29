import { i18n, m } from "$lib/i18n";
import { registerSchema } from "$lib/schemas/auth";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";
import { hashPassword } from "$lib/server/password";
import { adapter } from "$lib/utils/superform";
import { fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";

export const load = async (event) => {
  if (event.locals.user) redirect(302, i18n.resolveRoute("/events"));
  return {
    form: await superValidate(adapter(registerSchema))
  };
};

export const actions = {
  default: async (event) => {
    if (event.locals.user) redirect(302, i18n.resolveRoute("/events"));

    const form = await superValidate(event, adapter(registerSchema));
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    // TODO: return toast notification
    // const [existingUser] = await db
    //   .select({ id: userTable.id })
    //   .from(userTable)
    //   .where(eq(userTable.email, form.data.email));
    // if (existingUser.id) {
    //   return setError(form, 'email', "User already registered, try loggin");
    // }

    const hashedPassword = await hashPassword(form.data.password);
    const { id } = await db
      .insert(userTable)
      .values({
        email: form.data.email,
        hashedPassword
      })
      .returning({ id: userTable.id })
      .get();

    const token = generateSessionToken();
    const session = await createSession(token, id);
    setSessionTokenCookie(event, token, session.expiresAt);

    redirect(302, i18n.resolveRoute("/events"));
  }
};
