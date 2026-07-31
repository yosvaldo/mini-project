import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { api } from "../../configs/api.config";
import axios from "axios";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState<"Bali" | "Bandung" | "Jakarta" | "Surabaya" | "Yogyakarta">("Jakarta");
  const [eventDate, setEventDate] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [seats, setSeats] = useState<number>(100);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const glassStyle =
    "bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[32px] backdrop-saturate-[160%] border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        toast.error("Image size must be less than 1.5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !location || !eventDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl: string | null = null;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", imageFile);

        const uploadRes = await api.post("/storage/event-images", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        uploadedImageUrl = uploadRes.data?.data?.url || null;
      }

      const payload: Record<string, unknown> = {
        name,
        location,
        date: new Date(eventDate).toISOString(),
        price: Number(price),
        seats: Number(seats),
      };

      if (uploadedImageUrl) {
        payload.imageUrl = uploadedImageUrl;
      }

      await api.post("/events", payload);

      toast.success("Event created successfully!");
      navigate("/dashboard");
    } catch (error: unknown) {
      let message = "Failed to create event.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Event | Eventura</title>
      </Helmet>

      <div className="min-h-screen bg-eventura-dark p-4 pt-24 pb-16 flex justify-center">
        <div className={`w-full max-w-2xl ${glassStyle} p-8 sm:p-10 rounded-[28px]`}>
          <div className="mb-8 border-b border-white/10 pb-4">
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white">
              CREATE NEW EVENT
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Fill in the details below to host your exclusive event
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-luxury-gold">
                1. Basic Details
              </h2>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Symphony Night"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 p-3.5 text-xs text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    City / Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as "Bali" | "Bandung" | "Jakarta" | "Surabaya" | "Yogyakarta")}
                    className="w-full bg-eventura-navy p-3.5 text-xs text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all cursor-pointer"
                  >
                    <option value="Bali">Bali</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Banner Image (Optional)
                  </label>

                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10 group h-30">
                      <img
                        src={imagePreview}
                        alt="Event Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg text-xs transition-all shadow-md cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-30 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-luxury-gold/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-6 h-6 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-[10px] text-slate-400">
                          <span className="font-semibold text-luxury-gold">Click to upload banner</span> or drag & drop
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">PNG, JPG, WEBP, or GIF (Max 1.5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <h2 className="text-xs font-bold uppercase tracking-wider text-luxury-gold">
                2. Date & Schedule
              </h2>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Event Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-white/5 p-3.5 text-xs text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all scheme:dark"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <h2 className="text-xs font-bold uppercase tracking-wider text-luxury-gold">
                3. Ticket Capacity & Pricing
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Price (IDR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white/5 p-3.5 text-xs text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Total Seats / Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="w-full bg-white/5 p-3.5 text-xs text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-gold text-eventura-dark font-bold py-4 rounded-xl uppercase tracking-[0.2em] text-xs hover:bg-luxury-gold-light transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mt-6"
            >
              {loading ? "Publishing Event..." : "PUBLISH EVENT"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}