import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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

  const { authenticate } = authStore();

  const { mutateAsync: signin, isPending } = useSigninMutation({
    onError() {
      setError("email", { message: "Email or password is incorrect" });
      setError("password", { message: "Email or password is incorrect" });
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
        onSubmit={handleSubmit((data) => signin(data))}
      >
        <div>
          <img src="logo-localiza.jpg" alt="" className="h-[150px] w-[150px]" />
        </div>
        <div className="mgt-[10px] mb-[20px] text-center">
          <p>Acessibilidade para centros comerciais e eventos</p>
        </div>
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
              {" "}
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="Senha">Senha</label>
          <input
            type="text"
            placeholder="Digite sua senha"
            className={`border border-gray-300 rounded-md p-2 w-[300px]  ${
              errors.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-[#88A0BF] focus:ring-[#88A0BF]"
            }`}
            {...register("password")}
          />
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
        <div>
          <a href="#" className="text-[#1E90FF] ">
            Esqueci minha senha
          </a>
        </div>
        <div className="flex gap-[5px]">
          <p>OU</p>
        </div>
        <div>
          <a href="#" className="text-[#228B22]">
            Criar conta
          </a>
        </div>
      </form>
    </div>
  );
}
