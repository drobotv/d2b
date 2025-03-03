// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session, User } from "$lib/server/db/schema";

declare global {
  namespace App {
    interface Locals {
      user: Pick<User, "id" | "firstName" | "lastName" | "username" | "email" | "bio"> | null;
      session: Session | null;
    }
  }
}

export {};
