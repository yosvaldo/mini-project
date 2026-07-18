import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiStatic } from "../../configs/api.config";
import useAuthStore from "../../stores/authStore";
import { toast } from "sonner";

interface CheckoutPreview {
  basePrice: number;
  discount: number;
  finalPrice: number;
}

interface EventDetail {
  id: string;
  title: string;
  price: number;
  seats: number;
  description?: string;
}

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [useCouponId, setUseCouponId] = useState<string>("");
  
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await apiStatic.get(`/events/${eventId}`);
        setEvent(res.data.data);
      } catch {
        toast.error("Failed to load event information");
      }
    };
    if (eventId) fetchEventData();
  }, [eventId]);

  const updatePricePreview = useCallback(async () => {
    if (!eventId) return;
    setLoadingPreview(true);
    try {
      const res = await apiStatic.get("/transactions/preview", {
        params: {
          eventId,
          quantity,
          useCouponId: useCouponId || undefined,
          usePoints: String(usePoints),
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreview(res.data.data);
    } catch (error) {
      const axiosError = error as AxiosErrorLike;
      toast.error(axiosError.response?.data?.message || "Price adjustment calculation error");
    } finally {
      setLoadingPreview(false);
    }
  }, [eventId, quantity, useCouponId, usePoints, token]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      updatePricePreview();
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [updatePricePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size cannot exceed the 3MB system configuration limits.");
        return;
      }
      setPaymentFile(file);
    }
  };

  const handlePurchaseSubmit = async () => {
    if (!paymentFile) {
      toast.error("Please upload a file copy of your transaction receipt payment proof");
      return;
    }

    setSubmitting(true);
    setShowConfirm(false);

    const formData = new FormData();
    formData.append("eventId", eventId || "");
    formData.append("quantity", String(quantity));
    formData.append("usePoints", String(usePoints));
    if (useCouponId) formData.append("useCouponId", useCouponId);
    formData.append("paymentProof", paymentFile);

    try {
      await apiStatic.post("/transactions/purchase", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Ticket order successfully processed! Confirmation email sent.");
      navigate("/");
    } catch (error) {
      const axiosError = error as AxiosErrorLike;
      toast.error(axiosError.response?.data?.message || "Order submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="container mx-auto p-8 text-center text-slate-400">
        <h2 className="text-xl font-bold">Event details matching context records missing or item not found.</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl text-slate-100 bg-slate-900 rounded-xl shadow-md border border-slate-800">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Checkout Details</h1>
      <p className="text-slate-400 mb-8">Complete registration forms, claim points deductions, and attach valid verification proofs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h2 className="font-bold text-lg mb-1 text-teal-400">{event.title}</h2>
            <p className="text-sm text-slate-400">Base Price per seat: IDR {event.price.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantity (Tickets)</label>
            <input
              type="number"
              min="1"
              max={event.seats}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 focus:outline-none focus:border-teal-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Active Referral Discount Coupon ID</label>
            <input
              type="text"
              placeholder="Paste coupon alphanumeric system reference id string if available"
              value={useCouponId}
              onChange={(e) => setUseCouponId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 focus:outline-none focus:border-teal-500 text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center space-x-3 bg-slate-800 p-3 rounded border border-slate-700">
            <input
              type="checkbox"
              id="usePoints"
              checked={usePoints}
              onChange={(e) => setUsePoints(e.target.checked)}
              className="w-4 h-4 accent-teal-500 rounded"
            />
            <label htmlFor="usePoints" className="text-sm cursor-pointer select-none">
              Apply active point balances to discount final purchase summary cost
            </label>
          </div>

          <div className="border border-dashed border-slate-700 p-4 rounded-lg bg-slate-950 text-center">
            <label className="block text-sm font-medium text-slate-300 mb-2 cursor-pointer">
              Upload Payment Slip/Proof
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-400 hover:file:bg-slate-700 cursor-pointer"
            />
            {paymentFile && <p className="text-xs text-teal-400 mt-2 font-mono">Selected: {paymentFile.name}</p>}
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold border-b border-slate-800 pb-3 mb-4">Invoice Bill Calculation Summary</h3>
            {loadingPreview ? (
              <div className="text-slate-500 text-sm animate-pulse py-4">Recalculating billing totals balance matrix parameters...</div>
            ) : preview ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Subtotal Base Cost:</span>
                  <span>IDR {preview.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Calculated Applied Discounts:</span>
                  <span>- IDR {preview.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-slate-800 pt-3 mt-3 text-white">
                  <span>Net Total Amount Due:</span>
                  <span className="text-teal-400">IDR {preview.finalPrice.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">Fill configurations parameters adjustment forms accurately to produce bill layout blueprints.</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!paymentFile || submitting}
            className="w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            {submitting ? "Processing Transaction Delivery..." : "Submit Ticket Purchase Request"}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-xl max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-2">Confirm Purchase Action</h3>
            <p className="text-sm text-slate-400 mb-6">Are you sure you want to authorize this transaction? Make sure the payment file matches the required transaction amount.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchaseSubmit}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm font-semibold transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}