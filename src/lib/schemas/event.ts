import * as v from "valibot";

export const eventSchema = v.object({
  id: v.optional(v.string()),
  type: v.pipe(
    v.string(),
    v.minLength(3),
    v.maxLength(50),
    v.regex(/^[a-z0-9-_]+$/, "URL may only contain lowercase letters, numbers, `-`, and `_`")
  ),
  title: v.pipe(
    v.string(),
    v.minLength(1, "Title is required"),
    v.maxLength(100, "Title cannot exceed 100 characters")
  ),
  description: v.optional(v.pipe(v.string(), v.maxLength(500, "Description cannot exceed 500 characters"))),
  duration: v.pipe(
    v.number(),
    v.minValue(5, "Duration must be at least 5 minutes"),
    v.maxValue(1440, "Duration cannot exceed 24 hours")
  ),
  bufferTime: v.optional(
    v.pipe(
      v.number(),
      v.minValue(0, "Buffer time must be a positive number"),
      v.maxValue(1440, "Buffer time cannot exceed 24 hours")
    )
  ),
  requiresConfirmation: v.boolean(),
  isActive: v.boolean()
});

export type EventSchema = v.InferOutput<typeof eventSchema>;
