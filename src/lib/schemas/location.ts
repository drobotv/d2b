import * as v from "valibot";

export const locationSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Location name is required")),
  address: v.pipe(v.string(), v.nonEmpty("Address is required")),
  placeId: v.optional(v.number()),
  city: v.pipe(v.string(), v.nonEmpty("City is required")),
  state: v.pipe(v.string(), v.nonEmpty("State is required")),
  country: v.pipe(v.string(), v.nonEmpty("Country is required")),
  postalCode: v.pipe(v.string(), v.nonEmpty("Postal code is required")),
  boundingBox: v.array(v.string()),
  lat: v.number(),
  lng: v.number()
});

export type LocationFormData = v.InferOutput<typeof locationSchema>;
