export default function Form() {
  return (
    <div className="flex min-h-screen justify-center items-center bg-[#fff]">
      <div className="flex flex-col items-center gap-[10px]">
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
            className="border border-gray-300 rounded-md p-2 w-[300px]"
          />
        </div>
        <div className="flex flex-col gap-[5px]">
          <label htmlFor="Senha">Senha</label>
          <input
            type="text"
            placeholder="Digite sua senha"
            className="border border-gray-300 rounded-md p-2 w-[300px]"
          />
        </div>
        <div>
          <button className="bg-[#1E90FF] text-white rounded-lg p-2 w-[300px] mt-[10px] mb-[20px]">
            Entrar
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
      </div>
    </div>
  );
}
