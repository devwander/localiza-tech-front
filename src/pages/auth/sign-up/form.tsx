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
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<SignupType>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
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
        onSubmit={handleSubmit((data) => {
          const { confirmPassword, ...payload } = data as any;
          signup(payload);
        })}
      >
        <div>
          <img src="logo-localiza.png" alt="" className="h-[150px] w-[150px]" />
        </div>
        <div className="mgt-[10px] mb-[20px] text-center">
          <p>Junte-se a nossa comunidade de acessibilidade</p>
        </div>

        {/* Campo Nome */}
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="Nome">Nome Completo</label>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            className={`border border-gray-300 rounded-lg p-2 w-[300px] ${
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
            className={`border border-gray-300 rounded-lg p-2 w-[300px] ${
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
            placeholder="Crie sua senha"
            className={`border border-gray-300 rounded-lg p-2 w-[300px]  ${
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

        {/* Campo Confirmação de Senha */}
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="confirmPassword">Confirme sua senha</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirme sua senha"
            className={`border border-gray-300 rounded-lg p-2 w-[300px]  ${
              errors.confirmPassword
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-[#88A0BF] focus:ring-[#88A0BF]"
            }`}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-600 pl-1">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending || !isValid}
            className={`bg-[#1E90FF] text-white rounded-lg p-2 w-[300px] mt-[10px] mb-[20px] ${
              isPending || !isValid ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isPending ? "Criando conta..." : "Criar conta"}
          </button>
        </div>
        <div className=" flex gap-[5px]">
          <p>OU</p>
        </div>
        <div>
          <a 
          href="/sign-in" 
          className="text-[#1E90FF] hover:underline"
          onClick={() => navigate("/sign-in")}
            >
            Já tenho uma conta
          </a>
        </div>
      </form>
    </div>
  );
}
