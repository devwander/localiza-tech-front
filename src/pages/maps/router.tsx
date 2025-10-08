import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const MapList = lazy(() =>
  import("./list/index").then((module) => ({ default: module.MapList }))
);

const MapEditor = lazy(() =>
  import("./editor/index").then((module) => ({ default: module.MapEditor }))
);

export function MapsRouter() {
  return (
    <Routes>
      <Route index element={<MapList />} />
      <Route path=":id" element={<MapEditor />} />
      <Route path="*" element={<Navigate to="/dashboard/maps" replace />} />
    </Routes>
  );
}
