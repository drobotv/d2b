import { localizeUrl } from "$lib/paraglide/runtime";
import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
  const { session } = event.locals;

  if (session) {
    await invalidateSession(session.id);
    deleteSessionTokenCookie(event);
  }

  redirect(302, localizeUrl("/login"));
};
