import { z } from "zod";

export const SignupSchema = z
  .object({
    name: z.string().min(3, "Digite pelo menos 3 caracteres"),
    email: z.string().email("Digite um e-mail válido"),
    password: z.string().min(8, "Digite pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Digite pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas precisam ser iguais",
  });

export type SignupType = z.infer<typeof SignupSchema>;
