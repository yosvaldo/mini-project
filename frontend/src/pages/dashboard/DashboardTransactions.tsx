import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import api from "../../configs/api.config";
import useAuthStore from "../../stores/authStore";
import { Eye, X, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";

interface TransactionItem {
  id: string;
  totalPrice?: number;
  finalPrice?: number;
  quantity: number;
  status: "PENDING" | "DONE" | "REJECTED";
  createdAt: string;
  paymentProofUrl?: string;
  paymentProof?: string; 
  event: { name: string };
  user: { fullName: string; email: string };
}

interface ServerError {
  message?: string;
}

export default function DashboardTransactions() {
  const { accessToken } = useAuthStore();
  const [txs, setTxs] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProofUrl, setActiveProofUrl] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTxs = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/dashboard/metrics");
      setTxs(res.data?.data?.transactions || []);
    } catch {
      toast.error("Failed to gather financial database transaction streams.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    let active = true;
    const loadContent = async () => {
      if (active) {
        await fetchTxs();
      }
    };
    void loadContent();
    return () => {
      active = false;
    };
  }, [fetchTxs]);

  const updateStatus = async (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    try {
      await api.patch(
        `/transactions/${id}/status`,
        { status: action === "approve" ? "DONE" : "REJECTED" }
      );
      toast.success(`Transaction status updated to ${action === "approve" ? "DONE" : "REJECTED"}`);
      await fetchTxs();
    } catch (err) {
      const error = err as AxiosError<ServerError>;
      toast.error(error.response?.data?.message || "Failed to update transaction state.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-teal-400 font-mono animate-pulse">Decompiling ledger proofs metrics matrix...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Transaction Audit Ledger | Dashboard</title>
        <meta name="description" content="Review processing transaction invoices, inspect payment receipts, and declare confirmation blocks." />
      </Helmet>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Audit Verification Ledger</h1>
          <p className="text-sm text-slate-400 mt-1">Review processing transaction invoices, inspect payment receipts, and declare confirmation blocks.</p>
        </div>

        {txs.length === 0 ? (
          <div className="border border-slate-800 bg-slate-900 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <AlertCircle size={32} className="text-slate-700" />
            <p className="text-sm font-medium">Financial transaction history empty.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction Reference ID</th>
                    <th className="py-3 px-4">Event Context</th>
                    <th className="py-3 px-4">Purchaser Information</th>
                    <th className="py-3 px-4 text-center">Tickets Qty</th>
                    <th className="py-3 px-4 text-right">Value Due</th>
                    <th className="py-3 px-4 text-center">State Log</th>
                    <th className="py-3 px-4 text-center">Execution Interface</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {txs.map((t) => {
                    const proof = t.paymentProofUrl || t.paymentProof;
                    const amount = t.finalPrice ?? t.totalPrice ?? 0;
                    const isFreeEvent = amount === 0;

                    return (
                      <tr key={t.id} className="hover:bg-slate-950/30 transition">
                        <td className="py-3 px-4 text-slate-500 font-mono tracking-tight text-[11px] max-w-30 truncate">{t.id ?? "-"}</td>
                        <td className="py-3 px-4 text-white font-sans font-bold">{t.event?.name ?? "N/A"}</td>
                        <td className="py-3 px-4 font-sans">
                          <div className="text-slate-200 font-semibold">{t.user?.fullName ?? "Unknown"}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{t.user?.email ?? "-"}</div>
                        </td>
                        <td className="py-3 px-4 text-center text-teal-400 font-bold">{t.quantity ?? 0}</td>
                        <td className="py-3 px-4 text-right font-bold">
                          {isFreeEvent ? (
                            <span className="text-slate-400 font-mono text-[11px]">FREE</span>
                          ) : (
                            <span className="text-emerald-400">IDR {amount.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            t.status === "DONE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            t.status === "REJECTED" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {t.status ?? "PENDING"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            {isFreeEvent ? (
                              <div className="flex items-center space-x-1 text-slate-500 text-[10px] font-mono italic">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                <span>COMPLETED</span>
                              </div>
                            ) : (
                              <>
                                {proof ? (
                                  <button
                                    onClick={() => setActiveProofUrl(proof)}
                                    className="p-1 bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 transition cursor-pointer"
                                    title="Inspect Proof File Attachment"
                                  >
                                    <Eye size={12} />
                                  </button>
                                ) : (
                                  <div className="p-1 text-slate-600" title="No Payment Proof Uploaded"><X size={12} /></div>
                                )}

                                {t.status === "PENDING" && (
                                  <>
                                    <button
                                      disabled={processingId === t.id}
                                      onClick={() => updateStatus(t.id, "approve")}
                                      className="p-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded border border-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                                      title="Approve Transaction"
                                    >
                                      <Check size={12} />
                                    </button>
                                    <button
                                      disabled={processingId === t.id}
                                      onClick={() => updateStatus(t.id, "reject")}
                                      className="p-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                                      title="Reject Transaction"
                                    >
                                      <X size={12} />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeProofUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-w-lg w-full flex flex-col space-y-3 relative">
              <button
                onClick={() => setActiveProofUrl(null)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 bg-slate-950 rounded-full border border-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="w-full h-80 bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
                <img src={activeProofUrl} alt="Receipt proof" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}