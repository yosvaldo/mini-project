import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { signUpSchema } from "../../validators/auth.validator";
import useAuthStore from "../../stores/authStore";
import { toast } from "sonner";

type RegisterFormValues = z.infer<typeof signUpSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const glassStyle =
    "bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[32px] backdrop-saturate-[160%] border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
      referredByCode: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);

    await signUp(
      {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        referredByCode: data.referredByCode?.trim().toUpperCase() || undefined,
      },
      () => {
        toast.success("Account registered successfully! Please log in.");
        navigate("/login");
      }
    );

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Create Account | Eventura</title>
        <meta
          name="description"
          content="Join Eventura to explore or organize premium global events."
        />
      </Helmet>

      <div className="min-h-screen bg-eventura-dark flex items-center justify-center p-4 pt-24 pb-12">
        <div className={`w-full max-w-md ${glassStyle} p-8 sm:p-10 rounded-[28px]`}>
          <div className="text-center mb-6">
            <img
              src="/logo.webp"
              alt="Eventura Logo"
              className="h-10 w-auto object-contain mx-auto mb-3 filter drop-shadow-[0_0_8px_rgba(223,206,114,0.3)]"
            />
            <h2 className="text-xs text-white font-bold tracking-[0.2em] uppercase">
              CREATE ACCOUNT
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Join Eventura to explore or organize premium events
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="role" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
                Account Type
              </label>
              <select
                id="role"
                {...register("role")}
                className="w-full bg-eventura-navy p-3.5 text-[11px] text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all cursor-pointer"
              >
                <option value="CUSTOMER">Customer (Buy Tickets)</option>
                <option value="ORGANIZER">Organizer (Host Events)</option>
              </select>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                {...register("fullName")}
                className="w-full bg-white/5 p-3.5 text-[11px] text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
              />
              {errors.fullName && (
                <p className="text-red-400 text-[10px] mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                {...register("email")}
                className="w-full bg-white/5 p-3.5 text-[11px] text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
              />
              {errors.email && (
                <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full bg-white/5 p-3.5 text-[11px] text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
              />
              {errors.password && (
                <p className="text-red-400 text-[10px] mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="w-full bg-white/5 p-3.5 text-[11px] text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-[10px] mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="referredByCode" className="block text-[10px] font-bold tracking-wider uppercase text-luxury-gold mb-1.5">
                Referral Code (Optional)
              </label>
              <input
                id="referredByCode"
                type="text"
                autoComplete="off"
                placeholder="10% discount code"
                {...register("referredByCode")}
                className="w-full bg-white/5 p-3.5 text-[11px] text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-600 font-mono uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-gold text-eventura-dark font-bold py-4 rounded-xl uppercase tracking-[0.2em] text-[10px] hover:bg-luxury-gold-light transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mt-2"
            >
              {loading ? "Creating Account..." : "REGISTER NOW"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-[11px] text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-luxury-gold hover:underline font-semibold">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}