import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@shared/schema";

type AuthUser = Pick<User, "id" | "username" | "role" | "isManager">;

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const data = await api<{ user: AuthUser }>("/api/auth/me");
      setUser(data.user);
    } catch (err: any) {
      if (err?.status === 401) {
        setUser(null);
        sessionStorage.removeItem("token"); // ✅ não persiste
        return;
      }
      setUser(null);
    }
  };

  // ✅ não restaura login ao abrir (só se tiver token na sessão da aba)
  useEffect(() => {
    (async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        await refreshMe();
      } else {
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    });

    // ✅ salva só na sessão (ao fechar a aba/navegador, perde)
    sessionStorage.setItem("token", data.token);

    setUser(data.user);
    await refreshMe();
  };

  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // ignora
    } finally {
      sessionStorage.removeItem("token"); // ✅
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshMe,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}