import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

const Mapping = lazy(() =>
  import("./index").then((module) => ({ default: module.Mapping }))
);

export function MappingRouter() {
  return (
    <Routes>
      <Route path="/*" element={<Mapping />} />
    </Routes>
  );
}
