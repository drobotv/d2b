import { localizeUrl, serverMiddleware } from "$lib/paraglide/runtime";
import * as auth from "$lib/server/auth";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

function isAuthRoute(routeId: string | null) {
  return ["/(app)"].some((route) => routeId?.startsWith(route));
}

const handleAuth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(auth.sessionCookieName);

  if (!token && isAuthRoute(event.route.id)) {
    return redirect(302, localizeUrl("/login"));
  }

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

  event.locals.user = user && {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    bio: user.bio
  };
  event.locals.session = session;

  return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) => {
  return serverMiddleware(event.request, ({ request }) => resolve({ ...event, request }));
};

export const handle: Handle = sequence(handleAuth, handleParaglide);
