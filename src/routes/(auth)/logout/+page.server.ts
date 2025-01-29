import { i18n } from "$lib/i18n";
import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
  const { session } = event.locals;

  if (session) {
    await invalidateSession(session.id);
    deleteSessionTokenCookie(event);
  }

  redirect(302, i18n.resolveRoute("/"));
};
