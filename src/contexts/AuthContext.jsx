import { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("onit_token"));
  const [role, setRole] = useState(() => localStorage.getItem("onit_role"));

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem("onit_token", data.token);
    localStorage.setItem("onit_role", data.role);
    setToken(data.token);
    setRole(data.role);
    return data.role;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // best-effort
    } finally {
      localStorage.removeItem("onit_token");
      localStorage.removeItem("onit_role");
      setToken(null);
      setRole(null);
    }
  }, []);

  const isAuthenticated = Boolean(token);
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{ token, role, isAuthenticated, isAdmin, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}