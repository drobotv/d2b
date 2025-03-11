import { localizeUrl } from "$lib/paraglide/runtime";
import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
  if (event.locals.user) {
    redirect(302, localizeUrl("/events"));
  }

  redirect(302, localizeUrl("/login"));
};
