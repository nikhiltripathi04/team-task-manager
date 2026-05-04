import { createContext, useState, useContext, type ReactNode, useEffect } from "react";

interface AuthContextType {
  user: any;
  login: (data: { user: any; token: string }) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety net for session restoration
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Normalize _id to id if missing, but keep both for compatibility
        if (parsed._id && !parsed.id) parsed.id = parsed._id;
        setUser(parsed);
      } catch (err) {
        console.error("Session corruption detected, clearing storage.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (data: { user: any; token: string }) => {
    // Normalize user object for frontend consistency
    const userData = { ...data.user, id: data.user._id };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
