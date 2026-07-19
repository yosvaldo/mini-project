import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import useAuthStore from "../../stores/authStore";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password, () => {
        navigate("/");
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Welcome Back | Eventura</title>
        <meta name="description" content="Log in to review parameters and access ticket purchases securely." />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-xl max-w-md w-full space-y-4 text-white">
          <h2 className="text-2xl font-extrabold text-teal-400">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Log in to review parameters and access ticket purchases.</p>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 font-bold py-2 px-4 rounded text-sm transition"
          >
            {loading ? "Authenticating Account..." : "Sign In"}
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">
            New to Eventura? <Link to="/register" className="text-teal-400 hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </>
  );
}