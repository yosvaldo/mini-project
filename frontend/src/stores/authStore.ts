import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import axios from "axios";
import { api, setAccessToken } from "../configs/api.config";

export interface User {
  id: string;
  email: string;
  role: "CUSTOMER" | "ORGANIZER";
  fullName?: string;
  referralCode?: string;
  referredById?: string | null;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: "CUSTOMER" | "ORGANIZER";
  referredByCode?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  signUp: (data: RegisterPayload, onSuccess?: () => void) => Promise<void>;
  login: (data: { email: string; password: string }, onSuccess?: () => void) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User | null, accessToken: string | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user, accessToken });
      },

      signUp: async (data, onSuccess) => {
        try {
          await api.post("/auth/sign-up", data);
          if (onSuccess) onSuccess();
        } catch (error: unknown) {
          let message = "Failed to register account.";
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

          setAccessToken(accessToken || null);
          set({ user: user || null, accessToken: accessToken || null });

          toast.success("Logged in successfully!");
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
          setAccessToken(null);
          set({ user: null, accessToken: null });
          toast.success("Logged out successfully");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;