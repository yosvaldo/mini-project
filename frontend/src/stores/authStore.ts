import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: "CUSTOMER" | "ORGANIZER";
  referralCode: string;
}

interface AuthState {
  token: string | null;
  user: UserSession | null;
  setSession: (token: string, user: UserSession) => void;
  clearSession: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: "eventura-auth-storage",
    }
  )
);

export default useAuthStore;