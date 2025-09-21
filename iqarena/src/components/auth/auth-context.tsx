import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

export type UserRole = "student" | "faculty" | "hod" | "admin"| 'super-admin'| null;

export interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("jwt_token");
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        if (decoded && decoded.role_name) {
          setIsAuthenticated(true);
          setRole(decoded.role_name);
          setToken(storedToken);
        } else {
          setIsAuthenticated(false);
          setRole(null);
          setToken(null);
        }
      } catch {
        setIsAuthenticated(false);
        setRole(null);
        setToken(null);
      }
    }
  }, []);

  const login = (jwtToken: string) => {
    try {
      const decoded: any = jwtDecode(jwtToken);
      if (decoded && decoded.role_name) {
        setIsAuthenticated(true);
        setRole(decoded.role_name);
        setToken(jwtToken);
        localStorage.setItem("jwt_token", jwtToken);
      }
    } catch {
      setIsAuthenticated(false);
      setRole(null);
      setToken(null);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setToken(null);
    localStorage.removeItem("jwt_token");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
