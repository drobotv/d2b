import { i18n } from "$lib/i18n";
import * as auth from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const handleAuth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(auth.sessionCookieName);
  if (!token) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await auth.validateSessionToken(token);
  if (session) {
    auth.setSessionTokenCookie(event, token, session.expiresAt);
  } else {
    auth.deleteSessionTokenCookie(event);
  }

  event.locals.user = user;
  event.locals.session = session;

  return resolve(event);
};

const handleParaglide: Handle = i18n.handle();
export const handle: Handle = sequence(handleAuth, handleParaglide);
