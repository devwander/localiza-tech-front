import { useEffect, useRef, useState } from "react";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { authStore } from "../../store/auth.store";

export function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = authStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="cursor-pointer p-[5px] rounded-lg hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiMenu className="h-[25px] w-[25px] text-white" />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[200px] bg-white border rounded-lg shadow-lg z-50">
          <div
            className="px-4 py-3 cursor-pointer text-red-500 hover:bg-red-50 flex items-center justify-between"
            onClick={() => {
              setIsOpen(false);
              logout();
              navigate("/sign-in");
              toast.success("Logout efetuado com sucesso!");
            }}
          >
            <span>Sair</span>
            <FiLogOut size={16} />
          </div>
        </div>
      )}
    </div>
  );
}
