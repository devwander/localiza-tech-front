import type { ReactElement } from "react";
import { Outlet } from "react-router";

export function Private(): ReactElement {
  return <Outlet />;
}
