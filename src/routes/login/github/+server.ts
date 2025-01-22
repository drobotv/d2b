import { github } from "$lib/server/oauth";
import { generateState } from "arctic";

export const GET = async (event) => {
  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);

  event.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    maxAge: 60 * 10,
    secure: import.meta.env.PROD,
    path: "/",
    sameSite: "lax"
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString()
    }
  });
};
