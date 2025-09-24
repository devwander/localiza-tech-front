import { isAxiosError } from "axios";
import { Suspense, useEffect, type ReactElement } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Loading } from "../components";
import { api } from "../lib";
import { Signin } from "../pages/auth/sign-in";
import { Signup } from "../pages/auth/sign-up";
import { authStore } from "../store";
import { Public } from "./public";

export function Router(): ReactElement {
  const navigate = useNavigate();
  const { logged } = authStore.getState().load();

  // useEffect(() => {
  //   if (!logged) {
  //     navigate("/sign-in", { replace: true });
  //   }
  // }, [logged, navigate]);

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
        {!logged && (
          <Route element={<Public />}>
            <Route index element={<Navigate to={"/sign-in"} />} />
            <Route path="sign-in/" element={<Signin />} />
            <Route path="sign-up/" element={<Signup />} />
          </Route>
        )}
      </Routes>
    </Suspense>
  );
}
