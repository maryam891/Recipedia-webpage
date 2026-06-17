import { createContext } from "react";
export interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: User | null;
  signup: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

interface User {
  email: string;
  name?: string;
  userId: number;
}

export const AuthContext = createContext<AuthContextType | null>(null);
