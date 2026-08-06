import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import api from "../../configs/api.config";
import useAuthStore from "../../stores/authStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  DollarSign,
  Ticket,
  Layers,
  Search,
  AlertCircle,
  ExternalLink,
  Check,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface EventItem {
  id: string;
  name: string;
  price: number;
  seats: number;
  availableSeats: number;
  date: string;
}

interface TransactionItem {
  id: string;
  totalPrice?: number;
  finalPrice?: number;
  quantity: number;
  status: "PENDING" | "DONE" | "REJECTED";
  createdAt: string;
  paymentProof?: string;
  paymentProofUrl?: string;
  event: { name: string };
  user: { fullName: string };
}

interface TotalMetrics {
  revenue: number;
  ticketsSold: number;
}

export default function DashboardOverview() {
  const { accessToken } = useAuthStore();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalMetrics, setTotalMetrics] = useState<TotalMetrics>({ revenue: 0, ticketsSold: 0 });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [timeRange, setTimeRange] = useState<"YEAR" | "MONTH" | "DAY">("MONTH");

  const [activeProofUrl, setActiveProofUrl] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get("/dashboard/metrics", {
          params: {
            search: debouncedSearch || undefined,
            range: timeRange,
          },
        });

        setEvents(res.data?.data?.events ?? []);
        setTransactions(res.data?.data?.transactions ?? []);
        if (res.data?.data?.totalMetrics) {
          setTotalMetrics(res.data.data.totalMetrics);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          toast.error("Session expired or unauthorized access.");
        } else {
          toast.error("Could not populate dashboard data systems structures.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [accessToken, debouncedSearch, timeRange]);

  const handleUpdateStatus = async (transactionId: string, action: "approve" | "reject") => {
    const targetStatus = action === "approve" ? "DONE" : "REJECTED";
    setProcessingId(transactionId);

    try {
      await api.patch(`/dashboard/transactions/${transactionId}`, {
        status: targetStatus,
      });

      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? { ...t, status: targetStatus } : t))
      );

      toast.success(
        `Transaction ${action === "approve" ? "approved" : "rejected"} successfully!`
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to update transaction status.");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const chartData = useMemo(() => {
    const aggregations: Record<string, { label: string; revenue: number; volume: number }> = {};

    transactions.forEach((t) => {
      if (t.status !== "DONE") return;
      const dateObj = new Date(t.createdAt);

      const key =
        timeRange === "YEAR"
          ? String(dateObj.getFullYear())
          : timeRange === "MONTH"
          ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`
          : dateObj.toISOString().split("T")[0];

      if (!aggregations[key]) {
        aggregations[key] = { label: key, revenue: 0, volume: 0 };
      }
      aggregations[key].revenue += Number(t.finalPrice ?? t.totalPrice ?? 0);
      aggregations[key].volume += Number(t.quantity ?? 0);
    });

    return Object.values(aggregations).sort((a, b) => a.label.localeCompare(b.label));
  }, [transactions, timeRange]);

  if (loading && transactions.length === 0 && events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-teal-400 font-mono animate-pulse">
        Compiling organizational statistical components records metrics...
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Overview | Eventura</title>
        <meta
          name="description"
          content="Analyze consumer transactions, sales streams profiles, and filter range vectors metrics."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 pt-24 md:pt-28 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-teal-400 tracking-tight">Management Dashboard</h1>
            <p className="text-sm text-slate-400">
              Analyze consumer transactions, sales streams profiles, and verify payment proof requests.
            </p>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
            {(["YEAR", "MONTH", "DAY"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition uppercase cursor-pointer ${
                  timeRange === range ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Per {range.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Gross Aggregated Earnings</p>
              <p className="text-xl font-black text-white">IDR {totalMetrics.revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Ticket size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Distributed Attendee Tickets</p>
              <p className="text-xl font-black text-white">{totalMetrics.ticketsSold.toLocaleString()} Seats</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Tracked Events</p>
              <p className="text-xl font-black text-white">{events.length}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Approvals Queue</p>
              <p className="text-xl font-black text-white">
                {transactions.filter((t) => t.status === "PENDING").length} Action
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-sm font-bold tracking-wide text-slate-300 mb-4 uppercase">
              Revenue Realization Yield Graph
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#14b8a6"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={2}
                    name="Revenue (IDR)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-sm font-bold tracking-wide text-slate-300 mb-4 uppercase">
              Volume Purchase Distribution Tickets Velocity
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                  <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} name="Tickets Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Live Search Audit Trail & Approvals</h3>
              <p className="text-xs text-slate-400">
                Search criteria across client strings or event tags utilizing backend database queries.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by customer name or event title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 text-sm border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-teal-500 placeholder-slate-600 transition"
              />
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
              <AlertCircle size={32} className="text-slate-600 animate-bounce" />
              <p className="text-sm font-medium">No records or items matching criteria filters found in active indexes.</p>
              <p className="text-xs text-slate-600">Try modifying your search text queries parameters above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp Node</th>
                    <th className="py-3 px-4">Event Matrix Target</th>
                    <th className="py-3 px-4">Attendee Subscriber</th>
                    <th className="py-3 px-4 text-center">Seats Qty</th>
                    <th className="py-3 px-4 text-right">Net Value Charged</th>
                    <th className="py-3 px-4 text-center">Payment Proof</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono text-slate-300">
                  {transactions.map((t) => {
                    const proof = t.paymentProofUrl || t.paymentProof;
                    const amount = t.finalPrice ?? t.totalPrice ?? 0;

                    return (
                      <tr key={t.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-3 px-4 whitespace-nowrap">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {t.event?.name ?? "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          {t.user?.fullName ?? "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-center text-teal-400 font-bold">
                          {t.quantity ?? 0}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                          IDR {amount.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {proof ? (
                            <button
                              onClick={() => setActiveProofUrl(proof)}
                              className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 bg-slate-800/60 hover:bg-slate-800 px-2 py-1 rounded border border-slate-700 font-sans text-xs transition cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          ) : (
                            <span className="text-slate-600 font-sans text-xs">No Proof</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === "DONE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : t.status === "REJECTED"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {t.status ?? "PENDING"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {t.status === "PENDING" ? (
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                disabled={processingId === t.id}
                                onClick={() => handleUpdateStatus(t.id, "approve")}
                                className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded border border-emerald-500/30 transition cursor-pointer disabled:opacity-50"
                                title="Approve Payment"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                disabled={processingId === t.id}
                                onClick={() => handleUpdateStatus(t.id, "reject")}
                                className="p-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded border border-rose-500/30 transition cursor-pointer disabled:opacity-50"
                                title="Reject Payment"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-sans text-xs">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {activeProofUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-w-lg w-full flex flex-col space-y-3 relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white">Payment Proof Inspection</h4>
                <button
                  onClick={() => setActiveProofUrl(null)}
                  className="text-slate-400 hover:text-white p-1 bg-slate-950 rounded-full border border-slate-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="w-full h-80 bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
                <img src={activeProofUrl} alt="Receipt proof" className="max-w-full max-h-full object-contain" />
              </div>

              <div className="flex justify-end pt-2">
                <a
                  href={activeProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-sans"
                >
                  <span>Open raw file in new tab</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};