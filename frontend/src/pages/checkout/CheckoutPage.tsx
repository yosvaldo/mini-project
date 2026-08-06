import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../../configs/api.config";
import useAuthStore from "../../stores/authStore";
import { toast } from "sonner";

interface CheckoutPreview {
  basePrice: number;
  discount: number;
  finalPrice: number;
}

interface UserCoupon {
  id: string;
  discountPct: number;
  isUsed: boolean;
}

interface EventDetail {
  id: string;
  title?: string;
  name?: string;
  price: number;
  seats?: number;
  availableSeats?: number;
}

export default function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [fetchingEvent, setFetchingEvent] = useState<boolean>(true);

  const [quantity, setQuantity] = useState<number>(1);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [useCoupon, setUseCoupon] = useState<boolean>(false);
  const [availableCoupons, setAvailableCoupons] = useState<UserCoupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");

  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const eventPrice = event?.price;

  useEffect(() => {
    const initCheckout = async () => {
      setFetchingEvent(true);
      try {
        const resEvent = await api.get(`/events/${eventId}`);
        setEvent(resEvent.data?.data || resEvent.data);

        const resMe = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = resMe.data?.data || resMe.data;
        if (userData?.coupons && userData.coupons.length > 0) {
          setAvailableCoupons(userData.coupons);
          setSelectedCouponId(userData.coupons[0].id);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to load checkout details");
      } finally {
        setFetchingEvent(false);
      }
    };

    if (eventId && accessToken) initCheckout();
  }, [eventId, accessToken]);

  const updatePricePreview = useCallback(async () => {
    if (!eventId || !accessToken) return;
    setLoadingPreview(true);
    try {
      const res = await api.get("/transactions/preview", {
        params: {
          eventId,
          quantity,
          useCouponId: useCoupon && eventPrice !== 0 ? selectedCouponId : undefined,
          usePoints: eventPrice === 0 ? "false" : String(usePoints),
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = res.data?.data || res.data;
      setPreview(data);
    } catch (error) {
      console.error("Preview error:", error);
    } finally {
      setLoadingPreview(false);
    }
  }, [eventId, quantity, useCoupon, selectedCouponId, usePoints, accessToken, eventPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePricePreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [updatePricePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size cannot exceed 3MB limit.");
        return;
      }
      setPaymentFile(file);
    }
  };

  const handlePurchaseSubmit = async () => {
    const isFreeEvent = event?.price === 0;

    if (!isFreeEvent && !paymentFile) {
      toast.error("Please upload payment slip proof");
      return;
    }

    setSubmitting(true);
    setShowConfirm(false);

    const formData = new FormData();
    formData.append("eventId", eventId || "");
    formData.append("quantity", String(quantity));
    formData.append("usePoints", isFreeEvent ? "false" : String(usePoints));
    if (!isFreeEvent && useCoupon && selectedCouponId) {
      formData.append("useCouponId", selectedCouponId);
    }
    if (paymentFile) {
      formData.append("paymentProof", paymentFile);
    }

    try {
      await api.post("/transactions/purchase", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success("Ticket purchase successful!");
      navigate("/");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Order submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetchingEvent) {
    return (
      <div className="container mx-auto p-8 pt-32 text-center text-slate-400">
        <h2 className="text-xl font-bold animate-pulse">Loading event checkout details...</h2>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-8 pt-32 text-center text-slate-400">
        <h2 className="text-xl font-bold text-red-400">Event not found.</h2>
      </div>
    );
  }

  const isFree = event.price === 0;
  const eventTitle = event.title || event.name || "Event Pass";

  return (
    <>
      <Helmet>
        <title>{`Checkout - ${eventTitle}`}</title>
      </Helmet>

      <div className="container mx-auto p-8 pt-28 pb-12 my-8 max-w-4xl text-slate-100 bg-slate-900 rounded-xl border border-slate-800">
        <h1 className="text-3xl font-extrabold mb-2">Checkout Details</h1>
        <p className="text-slate-400 mb-8">Apply available discounts and complete your booking.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h2 className="font-bold text-lg text-teal-400">{eventTitle}</h2>
              <p className="text-sm text-slate-400 mt-1">
                Base Price: {isFree ? <span className="text-emerald-400 font-semibold">FREE</span> : `IDR ${event.price?.toLocaleString()}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {availableCoupons.length > 0 && (
              <div className={`flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700 ${isFree ? "opacity-50" : ""}`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="useCoupon"
                    disabled={isFree}
                    checked={!isFree && useCoupon}
                    onChange={(e) => setUseCoupon(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 rounded cursor-pointer disabled:cursor-not-allowed"
                  />
                  <label htmlFor="useCoupon" className="text-sm cursor-pointer select-none">
                    Use Referral 10% Discount Coupon {isFree && "(Not available for free events)"}
                  </label>
                </div>
              </div>
            )}

            <div className={`flex items-center space-x-3 bg-slate-800 p-3 rounded border border-slate-700 ${isFree ? "opacity-50" : ""}`}>
              <input
                type="checkbox"
                id="usePoints"
                disabled={isFree}
                checked={!isFree && usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="w-4 h-4 accent-teal-500 rounded cursor-pointer disabled:cursor-not-allowed"
              />
              <label htmlFor="usePoints" className="text-sm cursor-pointer select-none">
                Use Available Reward Points {isFree && "(Not available for free events)"}
              </label>
            </div>

            {!isFree && (
              <div className="border border-dashed border-slate-700 p-4 rounded-lg bg-slate-950 text-center">
                <label className="block text-sm font-medium text-slate-300 mb-2 cursor-pointer">
                  Upload Payment Proof
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-teal-400 hover:file:bg-slate-700 cursor-pointer"
                />
                {paymentFile && <p className="text-xs text-teal-400 mt-2">Selected: {paymentFile.name}</p>}
              </div>
            )}
          </div>

          <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold border-b border-slate-800 pb-3 mb-4">Invoice Bill Calculation Summary</h3>
              
              {loadingPreview ? (
                <div className="text-slate-500 text-sm animate-pulse py-4">Calculating total...</div>
              ) : preview ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal Price:</span>
                    <span>{isFree ? "IDR 0" : `IDR ${preview.basePrice.toLocaleString()}`}</span>
                  </div>
                  {!isFree && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discounts & Points Applied:</span>
                      <span>- IDR {preview.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t border-slate-800 pt-3 mt-3 text-white">
                    <span>Final Amount Due:</span>
                    <span className="text-teal-400">
                      {preview.finalPrice === 0 ? "FREE" : `IDR ${preview.finalPrice.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">Select quantity or options to render summary.</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={(!isFree && !paymentFile) || submitting}
              className="w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {submitting ? "Processing..." : isFree ? "Claim Free Ticket" : "Submit Purchase"}
            </button>
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-xl max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold mb-2">Confirm Purchase</h3>
              <p className="text-sm text-slate-400 mb-6">
                {isFree ? "Claim this free ticket?" : "Authorize this purchase order?"}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchaseSubmit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm font-semibold transition cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}