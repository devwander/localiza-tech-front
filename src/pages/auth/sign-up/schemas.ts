import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().min(3, "Enter at least 3 characters"),
  email: z.email(),
  password: z.string().min(8, "Enter at least 8 characters"),
});

export type SignupType = z.infer<typeof SignupSchema>;
