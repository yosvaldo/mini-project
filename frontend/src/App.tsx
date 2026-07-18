import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "./stores/authStore";
import { LogOut, LayoutDashboard, Calendar, CreditCard, User } from "lucide-react";

export default function App() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signOut(() => navigate("/login"));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {user && (
        <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black text-teal-400 tracking-wider uppercase">Eventura</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-700 uppercase">
              {user.role} Shell
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1 sm:gap-2">
            {user.role === "ORGANIZER" ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                    isActive("/dashboard") ? "bg-teal-600/10 text-teal-400 border border-teal-500/20" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayoutDashboard size={14} />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/dashboard/events"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                    isActive("/dashboard/events") ? "bg-teal-600/10 text-teal-400 border border-teal-500/20" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar size={14} />
                  <span>Events Config</span>
                </Link>
                <Link
                  to="/dashboard/transactions"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                    isActive("/dashboard/transactions") ? "bg-teal-600/10 text-teal-400 border border-teal-500/20" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard size={14} />
                  <span>Audit Review</span>
                </Link>
              </>
            ) : (
              <Link
                to="/profile"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                  isActive("/profile") ? "bg-teal-600/10 text-teal-400 border border-teal-500/20" : "text-slate-400 hover:text-white"
                }`}
              >
                <User size={14} />
                <span>My Profile Rewards</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition ml-2"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </nav>
      )}

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}