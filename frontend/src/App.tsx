import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import AppRouter from "./routers/app.router";
import useAuthStore from "./stores/authStore";
import api, { setAccessToken } from "./configs/api.config";

export default function App() {
  const { setAuth } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post("/auth/refresh-token");
        const { user, accessToken } = res.data.data;

        setAccessToken(accessToken);
        setAuth(user, accessToken);
      } catch {
        setAccessToken(null);
        setAuth(null, null);
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, [setAuth]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-mono animate-pulse">
        Initializing secure session token handshake...
      </div>
    );
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AppRouter />
      </BrowserRouter>
    </HelmetProvider>
  );
}