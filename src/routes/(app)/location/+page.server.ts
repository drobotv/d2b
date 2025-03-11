import { locationSchema } from "$lib/schemas/location";
import { db } from "$lib/server/db";
import { locationTable } from "$lib/server/db/schema";
import { adapter } from "$lib/utils/superform";
import { fail } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";

export const load = async ({ locals }) => {
  const location = await db.query.locationTable.findFirst({
    where: eq(locationTable.userId, locals.user!.id)
  });

  let form;

  if (location) {
    const formData = {
      name: location.name,
      address: location.address,
      placeId: location.placeId || undefined,
      city: location.city,
      state: location.state,
      country: location.country,
      postalCode: location.postalCode,
      boundingBox: JSON.parse(location.boundingBox as string),
      lat: location.lat,
      lng: location.lng,
      description: location.description || undefined
    };
    form = await superValidate(formData, adapter(locationSchema));
  } else {
    form = await superValidate({}, adapter(locationSchema), { errors: false });
  }

  return { location, form };
};

export const actions = {
  default: async ({ locals, request }) => {
    console.log("request", request);

    const form = await superValidate(request, adapter(locationSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const existingLocation = await db.query.locationTable.findFirst({
      where: eq(locationTable.userId, locals.user!.id)
    });

    if (existingLocation) {
      await db
        .update(locationTable)
        .set({
          name: form.data.name,
          address: form.data.address,
          placeId: form.data.placeId,
          city: form.data.city,
          state: form.data.state,
          country: form.data.country,
          postalCode: form.data.postalCode,
          boundingBox: JSON.stringify(form.data.boundingBox),
          lat: form.data.lat,
          lng: form.data.lng,
          description: form.data.description,
          updatedAt: new Date()
        })
        .where(and(eq(locationTable.id, existingLocation.id), eq(locationTable.userId, locals.user!.id)));
    } else {
      await db.insert(locationTable).values({
        userId: locals.user!.id,
        name: form.data.name,
        address: form.data.address,
        placeId: form.data.placeId,
        city: form.data.city,
        state: form.data.state,
        country: form.data.country,
        postalCode: form.data.postalCode,
        boundingBox: JSON.stringify(form.data.boundingBox),
        lat: form.data.lat,
        lng: form.data.lng,
        description: form.data.description,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return { form };
  }
};
