import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { apiStatic } from "../../configs/api.config";
import useAuthStore from "../../stores/authStore";
import { toast } from "sonner";

interface PointNode {
  id: string;
  amount: number;
  isUsed: boolean;
  expiresAt: string;
}

interface CouponNode {
  id: string;
  discountPct: number;
  isUsed: boolean;
  expiresAt: string;
}

interface RewardData {
  pointsBalance: number;
  activeCoupons: Array<{ id: string; discountPct: number; expiresAt: string }>;
}

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const [rewards, setRewards] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await apiStatic.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const pointsArray: PointNode[] = res.data.data.points || [];
        const couponsArray: CouponNode[] = res.data.data.coupons || [];
        const now = new Date();

        setRewards({
          pointsBalance: pointsArray.reduce(
            (acc: number, curr: PointNode) => 
              !curr.isUsed && new Date(curr.expiresAt) > now ? acc + curr.amount : acc, 
            0
          ),
          activeCoupons: couponsArray.filter(
            (c: CouponNode) => !c.isUsed && new Date(c.expiresAt) > now
          )
        });
      } catch {
        toast.error("Failed to load point balances or active coupon listings");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUserData();
  }, [token]);

  if (!user) return <div className="p-8 text-white">Please log in to review your profile context.</div>;

  return (
    <>
      <Helmet>
        <title>{`${user.fullName}'s Profile | Eventura`}</title>
        <meta name="description" content="Edit structural user info, copy system reference tokens, and audit your point balance records." />
      </Helmet>

      <div className="container mx-auto p-8 max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-400">{user.fullName}'s Profile</h1>
          <p className="text-sm text-slate-400">{user.email} • Role: {user.role}</p>
        </div>

        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Your Referral Link</h3>
          <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 font-mono text-sm text-teal-300">
            <span>{user.referralCode}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(user.referralCode);
                toast.success("Referral system string reference code copied to clipboard!");
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Share this code! When others sign up using it, they receive a 10% coupon and you gain 10,000 points.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="block text-xs text-slate-400 mb-1 font-medium">Points Balance</span>
            <span className="text-2xl font-extrabold text-teal-400">
              {loading ? "..." : `${rewards?.pointsBalance.toLocaleString()} pts`}
            </span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="block text-xs text-slate-400 mb-1 font-medium">Active Coupons</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {loading ? "..." : `${rewards?.activeCoupons.length || 0} active`}
            </span>
          </div>
        </div>

        {!loading && rewards && rewards.activeCoupons.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300">Available Coupons</h3>
            <div className="space-y-1">
              {rewards.activeCoupons.map((c) => (
                <div key={c.id} className="flex justify-between items-center text-xs font-mono bg-slate-800 p-2 rounded border border-slate-700">
                  <span className="text-slate-300">{c.id}</span>
                  <span className="text-emerald-400 font-bold">{c.discountPct}% OFF</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}