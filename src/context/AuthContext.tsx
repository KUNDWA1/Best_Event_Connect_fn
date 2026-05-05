import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  loginUser,
  registerUser,
  type AuthUserResponse,
  type BackendUserRole,
} from "../services/api";

type AppUserRole = "vendor" | "planner" | "admin";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: AppUserRole;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: AppUserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: BackendUserRole | string): AppUserRole => {
  if (role === "vendor") {
    return "vendor";
  }

  if (role === "admin") {
    return "admin";
  }

  return "planner";
};

const toBackendRole = (role: AppUserRole): BackendUserRole => {
  if (role === "planner") {
    return "event_planner";
  }

  return role;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeSession = useCallback((apiUser: AuthUserResponse, jwt: string) => {
    const normalizedUser: User = {
      userId: apiUser.userId,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      email: apiUser.email,
      phone: apiUser.phone || "",
      role: normalizeRole(apiUser.role || ""),
    };

    setToken(jwt);
    setUser(normalizedUser);
    localStorage.setItem("authToken", jwt);
    localStorage.setItem("authUser", JSON.stringify(normalizedUser));
    localStorage.setItem("userType", normalizedUser.role);
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User & {
          role: BackendUserRole | AppUserRole;
        };

        setToken(storedToken);
        setUser({
          ...parsedUser,
          role: normalizeRole(parsedUser.role),
        });
      } catch (err) {
        // Invalid stored data, clear it
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await loginUser(email, password);

        if (!response.token) {
          throw new Error("Login failed: missing authentication token");
        }

        storeSession(response.data as AuthUserResponse, response.token);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred during login";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true);
      setError(null);

      try {
        const response = await registerUser({
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          role: toBackendRole(payload.role),
        });

        if (!response.token) {
          throw new Error("Registration failed: missing authentication token");
        }

        storeSession(response.data, response.token);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred during registration";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeSession],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("userType");
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
