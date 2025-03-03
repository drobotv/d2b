import { m } from "$lib/i18n";
import * as v from "valibot";

export const personalInfoSchema = v.object({
  firstName: v.pipe(v.string(), v.maxLength(50, "First name must be at most 50 characters")),
  lastName: v.pipe(v.string(), v.maxLength(50, "Last name must be at most 50 characters")),
  bio: v.pipe(v.string(), v.maxLength(512, "Bio must be at most 512 characters"))
});

export const passwordChangeSchema = v.pipe(
  v.object({
    currentPassword: v.pipe(v.string(), v.nonEmpty("Current password is required")),
    newPassword: v.pipe(
      v.string(),
      v.nonEmpty("New password is required"),
      v.minLength(12, "Password must be at least 12 characters"),
      v.maxLength(128, "Password must be at most 128 characters")
    )
  })
);
