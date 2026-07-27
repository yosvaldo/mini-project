import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../../configs/api.config";
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
  paymentProof?: string | null;
  status: "PENDING" | "DONE" | "REJECTED";
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
        const res = await api.get("/auth/me", {
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

  const renderStatusBadge = (status: PurchasedTicket["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-400 border border-amber-900">
            Awaiting Organizer confirmation
          </span>
        );
      case "DONE":
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-900">
            Confirmed
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-red-950 text-red-400 border border-red-900">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${user.fullName || user.email}'s Profile | Eventura`}</title>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="block text-xs uppercase font-semibold text-slate-400 mb-1">
              Active Points Balance
            </span>
            <span className="text-3xl font-extrabold text-teal-400">
              {loading ? "..." : `${activePointsBalance.toLocaleString()} PTS`}
            </span>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="block text-xs uppercase font-semibold text-slate-400 mb-1">
              Active Referral Coupons
            </span>
            <span className="text-3xl font-extrabold text-emerald-400">
              {loading ? "..." : `${activeCouponsCount} Active`}
            </span>
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
            <div className="space-y-4">
              {transactionsList.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-teal-400 text-base">
                      {tx.event?.name || "Event Ticket"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      📅 {tx.event?.date ? new Date(tx.event.date).toLocaleDateString() : "N/A"} | 📍 {tx.event?.location || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Purchased on: {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                    
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-400">Payment Status:</span>
                      {renderStatusBadge(tx.status)}
                    </div>
                  </div>

                  <div className="text-left md:text-right border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 w-full md:w-auto flex flex-col items-start md:items-end justify-between space-y-3">
                    <div>
                      <span className="text-xs text-slate-400 block">
                        Quantity: {tx.quantity} Ticket(s)
                      </span>
                      <span className="text-sm font-bold text-white block">
                        Total: IDR {tx.finalPrice.toLocaleString()}
                      </span>
                    </div>

                    {tx.paymentProof && (
                      <a
                        href={tx.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 bg-slate-900 hover:bg-slate-800 border border-teal-500/30 hover:border-teal-400/50 px-3 py-1.5 rounded transition cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Payment Proof
                      </a>
                    )}
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