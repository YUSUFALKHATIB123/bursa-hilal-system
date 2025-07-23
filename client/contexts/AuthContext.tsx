import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "owner" | "manager" | "accountant" | "production";
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const USERS: { [email: string]: { password: string; user: User } } = {
  "yusuf@bursahilal.com": {
    password: "admin123",
    user: {
      id: "1",
      name: "Yusuf Alkhatib",
      email: "yusuf@bursahilal.com",
      role: "admin",
      permissions: ["*", "settings"], // Full access + settings
    },
  },
  "mustafa@bursahilal.com": {
    password: "owner123",
    user: {
      id: "2",
      name: "Mustafa Alkhatib",
      email: "mustafa@bursahilal.com",
      role: "owner",
      permissions: ["*", "settings"], // Full access + settings
    },
  },
  "mohammad@bursahilal.com": {
    password: "manager123",
    user: {
      id: "3",
      name: "Mohammad Alkhatib",
      email: "mohammad@bursahilal.com",
      role: "manager",
      permissions: [
        "orders",
        "inventory",
        "customers",
        "reports",
        "track-order",
      ],
    },
  },
  "accountant@bursahilal.com": {
    password: "account123",
    user: {
      id: "4",
      name: "Qutaiba",
      email: "accountant@bursahilal.com",
      role: "accountant",
      permissions: ["invoices", "financial"],
    },
  },
  "production@bursahilal.com": {
    password: "production123",
    user: {
      id: "5",
      name: "Abu Ibrahim",
      email: "production@bursahilal.com",
      role: "production",
      permissions: ["track-order", "employees"],
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem("bursahilal_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("bursahilal_user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const userRecord = USERS[email];

    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user);
      setIsAuthenticated(true);
      localStorage.setItem("bursahilal_user", JSON.stringify(userRecord.user));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("bursahilal_user");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return (
      user.permissions.includes("*") || user.permissions.includes(permission)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
