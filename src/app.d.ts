// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session, User } from "$lib/server/db/schema";

declare global {
  namespace App {
    interface Locals {
      user: Pick<User, "firstName" | "lastName" | "username" | "email"> | null;
      session: Session | null;
    }
  }
}

export {};
