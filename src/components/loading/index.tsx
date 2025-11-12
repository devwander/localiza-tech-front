import { Loader2 } from "lucide-react";
import type { ReactElement } from "react";

export function Loading(): ReactElement {
  return (
    <div className="flex items-center justify-center bg-[#EFEFEF] w-screen h-screen">
      <div className="flex flex-col items-center space-y-4">
        <Loader2
          className="animate-spin text-[#FF511C]"
          size={48}
          strokeWidth={2.5}
        />
        <p className="text-[##FF511C] text-lg font-medium">Carregando...</p>
      </div>
    </div>
  );
}
