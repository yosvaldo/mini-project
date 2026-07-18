import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiStatic, setAccessToken } from "../configs/api.config";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: "CUSTOMER" | "ORGANIZER";
  referralCode: string;
}

interface ErrorResponse {
  message?: string;
}

interface SignUpPayload {
  email: string;
  role: "CUSTOMER" | "ORGANIZER";
  password?: string;
  referredByCode?: string;
}

interface AuthState {
  token: string | null;
  user: UserSession | null;
  signIn: (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  signUp: (payload: SignUpPayload, onSuccess?: () => void) => Promise<void>;
  signOut: (onSuccess?: () => void) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      signIn: async (email, password, onSuccess) => {
        try {
          const res = await apiStatic.post("/auth/sign-in", { email, password });
          const { data } = res.data;
          
          const sessionUser: UserSession = {
            id: String(data.user.id),
            email: data.user.email,
            fullName: data.user.fullName || data.user.email.split("@")[0],
            role: data.user.role,
            referralCode: data.user.referralCode,
          };

          set({ token: data.accessToken, user: sessionUser });
          setAccessToken(data.accessToken);
          
          toast.success("Sign in successful!");
          onSuccess?.();
        } catch (error) {
          const err = error as AxiosError<ErrorResponse>;
          toast.error(err.response?.data?.message || "Sign in failed. Check your credentials.");
        }
      },

      signUp: async (payload, onSuccess) => {
        try {
          await apiStatic.post("/auth/sign-up", payload);
          toast.success("Sign up successful! Please sign in.");
          onSuccess?.();
        } catch (error) {
          const err = error as AxiosError<ErrorResponse>;
          toast.error(err.response?.data?.message || "Sign up failed. Please try again.");
        }
      },

      signOut: async (onSuccess) => {
        try {
          await apiStatic.post("/auth/sign-out").catch(() => {});
        } finally {
          set({ token: null, user: null });
          setAccessToken(null);
          toast.success("Sign out successful!");
          onSuccess?.();
        }
      },
    }),
    {
      name: "eventura-auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;