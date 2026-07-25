import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const glassStyle =
    "bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[32px] backdrop-saturate-[160%] border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      navigate('/events');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Invalid credentials";
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-eventura-dark flex items-center justify-center p-4 pt-20">
      <div className={`w-full max-w-sm ${glassStyle} p-8 sm:p-10 rounded-[28px]`}>
        <div className="text-center mb-8">
          <img
            src="/logo.webp"
            alt="Eventura Logo"
            className="h-10 w-auto object-contain mx-auto mb-4 filter drop-shadow-[0_0_8px_rgba(223,206,114,0.3)]"
          />
          <h2 className="text-xs text-white font-bold tracking-[0.2em] uppercase">
            Welcome Back
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Log in to manage your tickets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 p-4 text-[11px] text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
            />
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 p-4 text-[11px] text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
            />
          </div>
          <button
            disabled={submitting}
            className="w-full bg-luxury-gold text-eventura-dark font-bold py-4 rounded-xl uppercase tracking-[0.2em] text-[10px] hover:bg-luxury-gold-light transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Verifying...' : 'SIGN IN'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-[11px] text-slate-400">
            New to Eventura?{' '}
            <Link to="/register" className="text-luxury-gold hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;