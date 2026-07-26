import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import axios from "axios";
import { api } from "../utils/api.js"; 

export interface User {
  id: string;
  email: string;
  role: "CUSTOMER" | "ORGANIZER";
  fullName?: string;
  referralCode?: string;
  referredById?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  signUp: (
    data: {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: "CUSTOMER" | "ORGANIZER";
      referredByCode?: string;
    },
    onSuccess?: () => void
  ) => Promise<void>;
  login: (
    data: { email: string; password: string },
    onSuccess?: () => void
  ) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User | null, accessToken: string | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),

      signUp: async (data, onSuccess) => {
        try {
          await api.post("/auth/sign-up", data); // Removed "const response ="
          toast.success("Register successful, please login"); 
          if (onSuccess) onSuccess();
        } catch (error: unknown) {
          let message = "Failed to create account.";
          if (axios.isAxiosError(error) && error.response?.data?.message) {
            message = error.response.data.message;
          }
          toast.error(message);
        }
      },

      login: async (data, onSuccess) => {
        try {
          const response = await api.post("/auth/sign-in", data);
          const { accessToken, user } = response.data.data || {};
          set({ user: user || null, accessToken: accessToken || null });
          toast.success(response.data.message || "Logged in successfully!");
          if (onSuccess) onSuccess();
        } catch (error: unknown) {
          let message = "Invalid email or password.";
          if (axios.isAxiosError(error) && error.response?.data?.message) {
            message = error.response.data.message;
          }
          toast.error(message);
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/sign-out");
        } catch (error: unknown) {
          console.error("Logout error:", error);
        } finally {
          set({ user: null, accessToken: null });
          toast.success("Logged out successfully");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;