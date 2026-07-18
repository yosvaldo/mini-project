import { useState, useEffect, useMemo } from "react";
import { apiStatic } from "../../configs/api.config";
import useAuthStore from "../../stores/authStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Calendar, DollarSign, Ticket, Layers, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EventItem {
  id: string;
  title: string;
  price: number;
  seats: number;
  availableSeats: number;
  date: string;
}

interface TransactionItem {
  id: string;
  totalPrice: number;
  quantity: number;
  status: "PENDING" | "DONE" | "REJECTED";
  createdAt: string;
  event: { title: string };
  user: { fullName: string };
}

export default function DashboardOverview() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [timeRange, setTimeRange] = useState<"YEAR" | "MONTH" | "DAY">("MONTH");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await apiStatic.get("/dashboard/metrics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data.data.events);
        setTransactions(res.data.data.transactions);
      } catch {
        toast.error("Could not populate dashboard data systems structures.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.user.fullName.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [transactions, debouncedSearch]);

  const chartData = useMemo(() => {
    const aggregations: Record<string, { label: string; revenue: number; volume: number }> = {};

    filteredTransactions.forEach(t => {
      if (t.status !== "DONE") return;
      const dateObj = new Date(t.createdAt);
      
      const key = timeRange === "YEAR" 
        ? String(dateObj.getFullYear())
        : timeRange === "MONTH"
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`
        : dateObj.toISOString().split("T")[0];

      if (!aggregations[key]) {
        aggregations[key] = { label: key, revenue: 0, volume: 0 };
      }
      aggregations[key].revenue += t.totalPrice;
      aggregations[key].volume += t.quantity;
    });

    return Object.values(aggregations).sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredTransactions, timeRange]);

  const totalMetrics = useMemo(() => {
    const completeDone = transactions.filter(t => t.status === "DONE");
    return {
      revenue: completeDone.reduce((sum, t) => sum + t.totalPrice, 0),
      ticketsSold: completeDone.reduce((sum, t) => sum + t.quantity, 0),
    };
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-teal-400 font-mono animate-pulse">
        Compiling organizational statistical components records metrics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-teal-400 tracking-tight">Management Dashboard</h1>
          <p className="text-sm text-slate-400">Analyze consumer transactions, sales streams profiles, and filter range vectors metrics.</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {(["YEAR", "MONTH", "DAY"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition uppercase ${
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
          <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400"><DollarSign size={20} /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Gross Aggregated Earnings</p>
            <p className="text-xl font-black text-white">IDR {totalMetrics.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400"><Ticket size={20} /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Distributed Attendee Tickets</p>
            <p className="text-xl font-black text-white">{totalMetrics.ticketsSold.toLocaleString()} Seats</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400"><Layers size={20} /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Tracked Events</p>
            <p className="text-xl font-black text-white">{events.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400"><Calendar size={20} /></div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Approvals Queue</p>
            <p className="text-xl font-black text-white">{transactions.filter(t => t.status === "PENDING").length} Action</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-bold tracking-wide text-slate-300 mb-4 uppercase">Revenue Realization Yield Graph</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                <Area type="monotone" dataKey="revenue" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} name="Revenue (IDR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-bold tracking-wide text-slate-300 mb-4 uppercase">Volume Purchase Distribution Tickets Velocity</h3>
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
            <h3 className="text-base font-bold text-white">Live Search Audit Trail</h3>
            <p className="text-xs text-slate-400">Search criteria across client strings or event tags utilizing integrated safe debounce loops.</p>
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

        {filteredTransactions.length === 0 ? (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono text-slate-300">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-white">{t.event.title}</td>
                    <td className="py-3 px-4">{t.user.fullName}</td>
                    <td className="py-3 px-4 text-center text-teal-400 font-bold">{t.quantity}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">IDR {t.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}