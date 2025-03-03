import { m } from "$lib/i18n";
import { passwordChangeSchema, personalInfoSchema } from "$lib/schemas/userSettings";
import { db } from "$lib/server/db";
import { userTable } from "$lib/server/db/schema";
import { hashPassword, verifyPasswordHash } from "$lib/server/password";
import { adapter } from "$lib/utils/superform";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const { email, username, firstName, lastName, bio } = locals.user || {};

  const personalInfoForm = await superValidate(
    {
      firstName: firstName || "",
      lastName: lastName || "",
      bio: bio || ""
    },
    adapter(personalInfoSchema)
  );

  const passwordChangeForm = await superValidate(adapter(passwordChangeSchema));

  return {
    user: { email, username, firstName, lastName },
    personalInfoForm,
    passwordChangeForm
  };
};

export const actions: Actions = {
  updatePersonalInfo: async (event) => {
    const { locals, request } = event;
    if (!locals.user) {
      return redirect(302, "/login");
    }

    const form = await superValidate(request, adapter(personalInfoSchema));
    if (!form.valid) {
      return fail(400, { personalInfoForm: form });
    }

    try {
      await db
        .update(userTable)
        .set({
          firstName: form.data.firstName,
          lastName: form.data.lastName,
          bio: form.data.bio,
          updatedAt: new Date()
        })
        .where(eq(userTable.id, locals.user.id));

      return { personalInfoForm: form, success: true };
    } catch (error) {
      console.error("Error updating personal info:", error);
      return fail(500, {
        personalInfoForm: form,
        error: "Failed to update personal information"
      });
    }
  },

  changePassword: async ({ locals, request }) => {
    if (!locals.user) {
      return redirect(302, "/login");
    }

    const form = await superValidate(request, adapter(passwordChangeSchema));
    if (!form.valid) {
      return fail(400, { passwordChangeForm: form });
    }

    try {
      const userData = await db
        .select({
          hashedPassword: userTable.hashedPassword
        })
        .from(userTable)
        .where(eq(userTable.id, locals.user.id))
        .get();

      if (!userData) {
        return fail(404, {
          passwordChangeForm: form,
          error: "User not found"
        });
      }

      const isCurrentPasswordValid = await verifyPasswordHash(form.data.currentPassword, userData.hashedPassword || "");

      if (!isCurrentPasswordValid) {
        return setError(form, "currentPassword", "Current password is incorrect");
      }

      const hashedPassword = await hashPassword(form.data.newPassword);

      await db
        .update(userTable)
        .set({
          hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(userTable.id, locals.user.id));

      return { passwordChangeForm: form };
    } catch (error) {
      return fail(500, {
        passwordChangeForm: form,
        error: "Failed to change password"
      });
    }
  }
};
