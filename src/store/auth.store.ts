import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "../lib";

interface StoreAuth {
  token?: string;
  authenticate: (token: string) => void;
  load: () => { logged: boolean };
  logout: () => void;
}

export const authStore = create<StoreAuth>()(
  persist(
    (set, get) => ({
      token: undefined,

      authenticate: (token: string): void => {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        set((state) => ({
          ...state,
          token,
        }));
      },

      load: (): {
        logged: boolean;
      } => {
        const token = get()?.token || undefined;

        if (!token) {
          sessionStorage.clear();
          return { logged: false };
        }
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return { logged: true };
      },
      logout: (): void => {
        delete api.defaults.headers.common.Authorization;
        set((state) => ({
          ...state,
          token: undefined,
        }));
        sessionStorage.clear();
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
