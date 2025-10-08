import { Outlet, useNavigate } from "react-router";
import { Menu } from "./menu";

export function ManagementDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="w-full bg-[#1f2937] text-white py-3 md:py-4 px-4 md:px-6 flex justify-between items-center fixed z-50 top-0 shadow-lg">
        <div className="flex items-center gap-4">
          <h1
            className="text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors"
            onClick={() => navigate("/dashboard/maps")}
            title="Ir para lista de mapas"
          >
            LocalizaTech - Mapeamento
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Menu />
        </div>
      </div>

      <Outlet />
    </div>
  );
}
