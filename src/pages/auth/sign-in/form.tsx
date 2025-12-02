import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSigninMutation } from "../../../mutation";
import { authStore } from "../../../store";
import { SigninSchema, type SigninType } from "./schemas";

export function Form() {
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<SigninType>({
    resolver: zodResolver(SigninSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const { authenticate } = authStore();

  const { mutateAsync: signin, isPending } = useSigninMutation({
    onError() {
      setError("email", { message: "Email or password is incorrect" });
      setError("password", { message: "Email or password is incorrect" });
      toast.error("Email ou senha incorretos");
    },
    onSuccess: async ({ token: { token } }) => {
      toast.success("Login realizado com sucesso");
      authenticate(token);

      navigate("/");
    },
  });

  //const [state, nextState] = useState(initialState);

  return (
    <div className="flex min-h-screen justify-center items-center bg-[#fff]">
      <form
        className="flex flex-col items-center gap-[10px]"
        onSubmit={handleSubmit((data) => signin(data))}
      >
        <div>
          <img src="logo-localiza.png" alt="" className="h-[150px] w-[150px]" />
        </div>
        <div className="mgt-[10px] mb-[20px] text-center">
          <p>Acessibilidade para centros comerciais e eventos</p>
        </div>
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="E-mail">E-mail</label>
          <input
            type="text"
            placeholder="Digite seu e-mail"
            className={`border border-gray-300 rounded-lg p-2 w-[300px] ${
              errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-[#88A0BF] focus:ring-[#88A0BF]"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-sm text-red-600 pl-1">
              {" "}
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-[5px] relative">
          <label htmlFor="Senha">Senha</label>
          <div className="relative w-[300px]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              className={`border border-gray-300 rounded-lg p-2 w-[300px] pr-10 ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-[#88A0BF] focus:ring-[#88A0BF]"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-600"
            >
              {showPassword ? (
                // eye icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-eye-icon lucide-eye"
                >
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                // eye-off icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-eye-off-icon lucide-eye-off"
                >
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                  <path d="m2 2 20 20" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {errors.password && (
          <span className="text-sm text-red-600 pl-1">
            {" "}
            {errors.password.message}
          </span>
        )}
        <div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#1E90FF] text-white rounded-lg p-2 w-[300px] mt-[10px] mb-[20px]"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </div>
        <div className="flex gap-[5px]">
          <p>OU</p>
        </div>
        <div>
          <a
            href="#"
            className="text-[#228B22]"
            onClick={() => navigate("/sign-up")}
          >
            Criar conta
          </a>
        </div>
      </form>
    </div>
  );
}
