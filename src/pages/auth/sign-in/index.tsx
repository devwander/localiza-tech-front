import type { ReactElement } from "react";
import { Form } from "./form";

export function Signin(): ReactElement {
  return (
    <div className="w-full min-h-screen bg-[##FF511C] flex items-center justify-center p-4">
      <Form />
    </div>
  );
}
