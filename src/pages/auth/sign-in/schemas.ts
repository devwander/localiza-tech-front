import { z } from "zod";

export const SigninSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Enter at least 8 characters"),
});

export type SigninType = z.infer<typeof SigninSchema>;
