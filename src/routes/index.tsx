import { isAxiosError } from "axios";
import { lazy, Suspense, useEffect, type ReactElement } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Loading } from "../components";
import { ManagementDashboard } from "../layout";
import { api } from "../lib";
import { Signin } from "../pages/auth/sign-in";
import { Signup } from "../pages/auth/sign-up";
import { MapPublicView } from "../pages/maps/public";
import { StoresPage } from "../pages/stores";
import { authStore } from "../store";
import { Private } from "./private";
import { Public } from "./public";

export const MappingRequestsRouter = lazy(() =>
  import("../pages/mapping/router").then((module) => ({
    default: module.MappingRouter,
  }))
);

export const MapsRouter = lazy(() =>
  import("../pages/maps/router").then((module) => ({
    default: module.MapsRouter,
  }))
);

export function Router(): ReactElement {
  const navigate = useNavigate();
  const { logged } = authStore.getState().load();

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosError(error)) {
          console.log(error);
          const status = error.response?.status;
          const message = error.response?.data?.message;

          if (status === 401 && message === "Unauthorized.") {
            sessionStorage.clear();
            navigate("/sign-in", { replace: true });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [navigate]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route path="/maps/public/:id" element={<MapPublicView />} />

        {!logged && (
          <Route element={<Public />}>
            <Route index element={<Navigate to={"/sign-in"} />} />
            <Route path="sign-in/" element={<Signin />} />
            <Route path="sign-up/" element={<Signup />} />
          </Route>
        )}

        {logged && (
          <Route
            path="/"
            element={<Navigate to={"/dashboard/maps"} replace />}
          />
        )}

        {logged && (
          <Route element={<Private />}>
            <Route element={<ManagementDashboard />}>
              <Route path="/dashboard/maps/*" element={<MapsRouter />} />
              <Route path="/mapping" element={<MappingRequestsRouter />} />
              <Route path="/stores/:mapId" element={<StoresPage />} />
            </Route>
          </Route>
        )}
      </Routes>
    </Suspense>
  );
}
