import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { api } from "../../configs/api.config";
import axios from "axios";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Jakarta");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  
  const [price, setPrice] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(100);

  const glassStyle =
    "bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-[32px] backdrop-saturate-[160%] border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !location || !eventDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        description,
        city,
        location,
        startDate: new Date(eventDate).toISOString(),
        tickets: [
          {
            price: Number(price),
            capacity: Number(capacity),
          },
        ],
      };

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
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
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
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Ballroom"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white/5 p-3.5 text-xs text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 p-3.5 text-xs text-white border border-white/10 rounded-xl outline-none focus:border-luxury-gold/50 transition-all placeholder-slate-500"
                />
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
                3. Initial Ticket Tier
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
                    Total Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
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