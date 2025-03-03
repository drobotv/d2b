import { m } from "$lib/i18n";
import * as v from "valibot";

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty(), v.email()),
  password: v.pipe(v.string(), v.nonEmpty(), v.minLength(12), v.maxLength(128))
});

export const registerSchema = v.pipe(
  v.object({
    username: v.pipe(v.string(), v.nonEmpty(), v.minLength(3), v.maxLength(50)),
    email: v.pipe(v.string(), v.nonEmpty(), v.email()),
    password: v.pipe(v.string(), v.nonEmpty(), v.minLength(12), v.maxLength(128)),
    confirmPassword: v.string()
  }),
  v.forward(
    v.check((value) => value.password === value.confirmPassword),
    ["confirmPassword"]
  )
);
