import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "./auth.api";
import type { AuthUser } from "./auth.types";
import { authTokenStore } from "@/store/auth.store";
import { authSessionStore } from "@/store/auth-session.store";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  setUser(user: AuthUser | null): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    authApi
      .refresh()
      .then((payload) => {
        authTokenStore.set(payload.accessToken);
        setUser(payload.user);
      })
      .catch(() => {
        authTokenStore.clear();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      async login(email, password) {
        const payload = await authApi.login({ email, password });
        await queryClient.cancelQueries();
        queryClient.clear();
        authTokenStore.set(payload.accessToken);
        setUser(payload.user);
        return payload.user;
      },
      async logout() {
        try {
          await authApi.logout();
        } finally {
          await queryClient.cancelQueries();
          queryClient.clear();
          authTokenStore.clear();
          authSessionStore.clear();
          setUser(null);
        }
      },
      setUser,
    }),
    [user, initializing, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
