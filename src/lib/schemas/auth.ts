import * as v from "valibot";

export const emailRegisterSchema = v.pipe(
  v.object({
    email: v.pipe(v.string(), v.nonEmpty(), v.email()),
    password: v.pipe(v.string(), v.nonEmpty(), v.minLength(12), v.maxLength(128)),
    confirmPassword: v.string()
  }),
  v.forward(
    v.check((value) => value.password === value.confirmPassword),
    ["confirmPassword"]
  )
);
