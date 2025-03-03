import * as v from "valibot";

const timeCheck = v.pipe(
  v.number(),
  v.check(
    (value) => value >= 0 && value < 1440 && value % 15 === 0,
    "Time must be in 15-minute intervals between 00:00 and 23:59"
  )
);

const dayAvailabilitySchema = v.object({
  start: timeCheck,
  end: timeCheck,
  enabled: v.boolean()
});

const exceptionSchema = v.object({
  date: v.date(),
  isAvailable: v.boolean(),
  customHours: v.optional(
    v.object({
      start: timeCheck,
      end: timeCheck
    })
  )
});

export const availabilitySchema = v.object({
  timeZone: v.pipe(
    v.string(),
    v.custom((input: unknown) => {
      if (typeof input !== "string") return false;
      try {
        Intl.DateTimeFormat(undefined, { timeZone: input });
        return true;
      } catch {
        return false;
      }
    }, "Invalid timezone")
  ),
  weeklySchedule: v.object({
    0: dayAvailabilitySchema,
    1: dayAvailabilitySchema,
    2: dayAvailabilitySchema,
    3: dayAvailabilitySchema,
    4: dayAvailabilitySchema,
    5: dayAvailabilitySchema,
    6: dayAvailabilitySchema
  })
  // exceptions: v.array(exceptionSchema)
});
