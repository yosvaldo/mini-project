import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { apiStatic } from "../../configs/api.config";
import useAuthStore from "../../stores/authStore";
import { toast } from "sonner";

interface PointRecord {
  id: string;
  amount: number;
  isUsed: boolean;
  expiresAt: string;
}

interface CouponRecord {
  id: string;
  discountPct: number;
  isUsed: boolean;
  expiresAt: string;
}

interface PurchasedTicket {
  id: string;
  quantity: number;
  finalPrice: number;
  createdAt: string;
  event: {
    id: string;
    name: string;
    date: string;
    location: string;
  };
}

interface UserProfileData {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  referralCode?: string;
  points: PointRecord[];
  coupons: CouponRecord[];
  transactions: PurchasedTicket[];
}

export default function ProfilePage() {
  const { user, accessToken } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await apiStatic.get("/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setProfile(res.data?.data || res.data);
      } catch {
        toast.error("Failed to load user profile details");
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchUserData();
  }, [accessToken]);

  if (!user) {
    return (
      <div className="container mx-auto p-8 pt-28 text-center text-white">
        Please log in to review your profile.
      </div>
    );
  }

  const now = new Date();
  const pointsList = profile?.points || [];
  const couponsList = profile?.coupons || [];
  const transactionsList = profile?.transactions || [];

  const activePointsBalance = pointsList
    .filter((p) => !p.isUsed && new Date(p.expiresAt) > now)
    .reduce((acc, p) => acc + p.amount, 0);

  const activeCouponsCount = couponsList.filter(
    (c) => !c.isUsed && new Date(c.expiresAt) > now
  ).length;

  return (
    <>
      <Helmet>
        <title>{`${user.fullName || user.email}'s Profile | Eventura`}</title>
        <meta
          name="description"
          content="Review your purchased tickets, active point balances, and referral discount coupon expirations."
        />
      </Helmet>

      <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-white space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-teal-400">
              {user.fullName || user.email}
            </h1>
            <p className="text-sm text-slate-400">
              {user.email} • Role: <span className="capitalize">{user.role}</span>
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm flex flex-col gap-1">
            <span className="text-xs uppercase text-slate-400 font-semibold">
              Your Referral Code
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-teal-300 font-bold text-base">
                {profile?.referralCode || user.referralCode || "N/A"}
              </span>
              <button
                onClick={() => {
                  const code = profile?.referralCode || user.referralCode;
                  if (code) {
                    navigator.clipboard.writeText(code);
                    toast.success("Referral code copied to clipboard!");
                  } else {
                    toast.error("No referral code available.");
                  }
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded transition cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="block text-xs uppercase font-semibold text-slate-400 mb-1">
              Active Points Balance
            </span>
            <span className="text-3xl font-extrabold text-teal-400">
              {loading ? "..." : `${activePointsBalance.toLocaleString()} PTS`}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Earn 10,000 pts whenever someone registers with your code.
            </p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="block text-xs uppercase font-semibold text-slate-400 mb-1">
              Active Referral Coupons
            </span>
            <span className="text-3xl font-extrabold text-emerald-400">
              {loading ? "..." : `${activeCouponsCount} Active`}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              10% discount coupons awarded from referral registration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h2 className="text-base font-bold text-slate-200">
              Points History & Expiration
            </h2>
            {pointsList.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-500 text-center">
                No point records available.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {pointsList.map((pt) => {
                  const isExpired = new Date(pt.expiresAt) < now;
                  return (
                    <div
                      key={pt.id}
                      className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-200 block">
                          +{pt.amount.toLocaleString()} PTS
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Expires: {new Date(pt.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          pt.isUsed
                            ? "bg-slate-800 text-slate-500"
                            : isExpired
                            ? "bg-red-950 text-red-400 border border-red-900"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-900"
                        }`}
                      >
                        {pt.isUsed ? "Used" : isExpired ? "Expired" : "Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h2 className="text-base font-bold text-slate-200">
              Coupons & Expiration
            </h2>
            {couponsList.length === 0 ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-500 text-center">
                No referral coupons available.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {couponsList.map((cp) => {
                  const isExpired = new Date(cp.expiresAt) < now;
                  return (
                    <div
                      key={cp.id}
                      className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-200 block">
                          {cp.discountPct}% Discount Coupon
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Expires: {new Date(cp.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cp.isUsed
                            ? "bg-slate-800 text-slate-500"
                            : isExpired
                            ? "bg-red-950 text-red-400 border border-red-900"
                            : "bg-teal-950 text-teal-400 border border-teal-900"
                        }`}
                      >
                        {cp.isUsed ? "Used" : isExpired ? "Expired" : "Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold text-white">Purchased Tickets</h2>

          {loading ? (
            <div className="p-6 text-center text-slate-400 text-sm animate-pulse">
              Loading purchased tickets...
            </div>
          ) : transactionsList.length === 0 ? (
            <div className="p-8 bg-slate-950 border border-slate-800 rounded-lg text-center text-slate-500 space-y-1">
              <p className="font-medium text-slate-400 text-sm">
                No tickets purchased yet.
              </p>
              <p className="text-xs">
                Browse our upcoming events and order your tickets!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactionsList.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <h3 className="font-bold text-teal-400 text-base">
                      {tx.event?.name || "Event Ticket"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      📅 {tx.event?.date ? new Date(tx.event.date).toLocaleDateString() : "N/A"} | 📍 {tx.event?.location || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Purchased on: {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left md:text-right border-t md:border-t-0 border-slate-800 pt-2 md:pt-0 w-full md:w-auto">
                    <span className="text-xs text-slate-400 block">
                      Quantity: {tx.quantity} Ticket(s)
                    </span>
                    <span className="text-sm font-bold text-white">
                      Total: IDR {tx.finalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}