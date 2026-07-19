import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import useAuthStore from "../../stores/authStore";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "ORGANIZER">("CUSTOMER");
  const [referredByCode, setReferredByCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    
    await signUp(
      {
        email,
        password,
        role,
        referredByCode: referredByCode || undefined,
      },
      () => {
        navigate("/login");
      }
    );

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Create Account | Eventura</title>
        <meta name="description" content="Join Eventura to explore or organize premium global events." />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-950">
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-xl max-w-md w-full space-y-4 text-white">
          <h2 className="text-2xl font-extrabold text-teal-400">Create Account</h2>
          <p className="text-slate-400 text-sm">Join Eventura to explore or organize premium global events.</p>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 focus:outline-none focus:border-teal-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 focus:outline-none focus:border-teal-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">Account Type / Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "CUSTOMER" | "ORGANIZER")}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 focus:outline-none focus:border-teal-500 text-sm"
            >
              <option value="CUSTOMER">Customer (Buy Tickets)</option>
              <option value="ORGANIZER">Organizer (Host Events)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-teal-500">Referral Code (Optional)</label>
            <input
              type="text"
              placeholder="Get a 10% coupon by adding a code"
              value={referredByCode}
              onChange={(e) => setReferredByCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 focus:outline-none focus:border-teal-500 text-sm placeholder-slate-600 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 font-bold py-2 px-4 rounded text-sm transition text-white disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">
            Already have an account? <Link to="/login" className="text-teal-400 hover:underline">Log in here</Link>
          </p>
        </form>
      </div>
    </>
  );
}