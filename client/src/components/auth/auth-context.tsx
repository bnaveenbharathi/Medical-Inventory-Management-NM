import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { setLogoutCallback } from "@/lib/auth-fetch";

export type UserRole = "student" | "faculty" | "hod" | "admin"| 'super-admin'| null;

export interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  token: string | null;
  login: (token: string) => void;
  logout: (showExpiredMessage?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Logout function
  const logout = (showExpiredMessage: boolean = false) => {
    setIsAuthenticated(false);
    setRole(null);
    setToken(null);
    localStorage.removeItem("jwt_token");
    
    if (showExpiredMessage) {
      toast.error("Session expired. Please login again.");
    }
  };

  // Restore session from localStorage and check expiration
  useEffect(() => {
    const storedToken = localStorage.getItem("jwt_token");
    if (storedToken) {
      try {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          logout(true);
          return;
        }

        const decoded: any = jwtDecode(storedToken);
        if (decoded && decoded.role_name) {
          setIsAuthenticated(true);
          setRole(decoded.role_name);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, []);

  // Set up interval to check token expiration every minute
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (token && isTokenExpired(token)) {
        logout(true);
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Set up interval to check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [token]);

  // Set up the logout callback for the auth-fetch utility
  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  const login = (jwtToken: string) => {
    try {
      // Check if token is expired before setting it
      if (isTokenExpired(jwtToken)) {
        logout();
        return;
      }

      const decoded: any = jwtDecode(jwtToken);
      if (decoded && decoded.role_name) {
        setIsAuthenticated(true);
        setRole(decoded.role_name);
        setToken(jwtToken);
        localStorage.setItem("jwt_token", jwtToken);
      }
    } catch {
      logout();
    }
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
