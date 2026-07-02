import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function loadStoredUser(): User | null {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");
  if (!storedUser || !storedToken) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Lazy-init from localStorage so the very first render already knows
  // whether the user is logged in — avoids a redirect-to-login flash
  // on page refresh while an effect would otherwise still be pending.
  const [user, setUser] = useState<User | null>(loadStoredUser);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);