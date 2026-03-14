import { create } from "zustand";

export type UserRole = "admin" | "teacher" | "parent";

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));

// Demo credentials
export const demoCredentials = [
  {
    role: "admin" as UserRole,
    email: "admin@madrasa.com",
    password: "admin123",
    name: "Admin – Darul Huda",
    id: "ADMIN001",
  },
  {
    role: "teacher" as UserRole,
    email: "kareem@madrasa.com",
    password: "teacher123",
    name: "Usthad Abdul Kareem",
    id: "T001",
  },
  {
    role: "parent" as UserRole,
    email: "abdullah@email.com",
    password: "parent123",
    name: "Abdullah Rahman",
    id: "P001",
  },
];
