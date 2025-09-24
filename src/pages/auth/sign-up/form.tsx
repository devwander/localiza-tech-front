import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSignupMutation } from "../../../mutation";
import { authStore } from "../../../store";
import { SignupSchema, type SignupType } from "./schemas";

export function Form() {
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<SignupType>({
    resolver: zodResolver(SignupSchema),
  });

  const { authenticate } = authStore();

  const { mutateAsync: signup, isPending } = useSignupMutation({
    onError() {
      setError("email", { message: "E-mail já cadastrado ou inválido" });
    },
    onSuccess: async ({ token: { token } }) => {
      authenticate(token);
      navigate("/");
    },
  });

  return (
    <div className="flex min-h-screen justify-center items-center bg-[#fff]">
      <form
        className="flex flex-col items-center gap-[10px]"
        onSubmit={handleSubmit((data) => signup(data))}
      >
        <div>
          <img src="logo-localiza.jpg" alt="" className="h-[150px] w-[150px]" />
        </div>
        <div className="mgt-[10px] mb-[20px] text-center">
          <p>Crie sua conta para acessar centros comerciais e eventos</p>
        </div>

        {/* Campo Nome */}
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="Nome">Nome</label>
          <input
            type="text"
            placeholder="Digite seu nome"
            className={`border border-gray-300 rounded-md p-2 w-[300px] ${
              errors.name
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-[#88A0BF] focus:ring-[#88A0BF]"
            }`}
            {...register("name")}
          />
          {errors.name && (
            <span className="text-sm text-red-600 pl-1">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Campo Email */}
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="E-mail">E-mail</label>
          <input
            type="text"
            placeholder="Digite seu e-mail"
            className={`border border-gray-300 rounded-md p-2 w-[300px] ${
              errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-[#88A0BF] focus:ring-[#88A0BF]"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-sm text-red-600 pl-1">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Campo Senha */}
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="Senha">Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            className={`border border-gray-300 rounded-md p-2 w-[300px]  ${
              errors.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-[#88A0BF] focus:ring-[#88A0BF]"
            }`}
            {...register("password")}
          />
          {errors.password && (
            <span className="text-sm text-red-600 pl-1">
              {errors.password.message}
            </span>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#228B22] text-white rounded-lg p-2 w-[300px] mt-[10px] mb-[20px]"
          >
            {isPending ? "Criando conta..." : "Criar conta"}
          </button>
        </div>

        <div>
          <a href="/login" className="text-[#1E90FF] hover:underline">
            Já tenho uma conta
          </a>
        </div>
      </form>
    </div>
  );
}
