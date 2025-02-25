import * as v from "valibot";

const timeCheck = v.pipe(
  v.number(),
  v.check((value) => value >= 0 && value < 1440 && value % 15 === 0)
);

const dayAvailabilitySchema = v.pipe(
  v.object({
    start: timeCheck,
    end: timeCheck,
    enabled: v.boolean()
  }),
  v.forward(
    v.check((value) => value.start < value.end),
    ["start"]
  )
);

export const availabilitySchema = v.object({
  timeZone: v.string(),
  availability: v.object({
    0: dayAvailabilitySchema,
    1: dayAvailabilitySchema,
    2: dayAvailabilitySchema,
    3: dayAvailabilitySchema,
    4: dayAvailabilitySchema,
    5: dayAvailabilitySchema,
    6: dayAvailabilitySchema
  })
});
