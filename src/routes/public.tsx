import type { ReactElement } from "react";
import { Outlet } from "react-router";

export function Public(): ReactElement {
  return <Outlet />;
}
