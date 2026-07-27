import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../../configs/api.config";
import useAuthStore from "../../stores/authStore";
import { Plus, Calendar, Landmark, Trash2, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";

interface EventItem {
  id: string;
  name: string;
  price: number;
  seats: number;
  availableSeats: number;
  date: string;
  location: string;
}

interface ServerError {
  message?: string;
}

export default function DashboardEvents() {
  const { accessToken } = useAuthStore();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/dashboard/metrics", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setEvents(res.data.data.events || []);
    } catch {
      toast.error("Failed to sync event listings data structures.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    let active = true;
    const loadContent = async () => {
      if (active) {
        await fetchEvents();
      }
    };
    void loadContent();
    return () => {
      active = false;
    };
  }, [fetchEvents]);

  const handleCreateEvent = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !price || !seats || !date || !location) {
      toast.error("All configuration parameters are required.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(
        "/events",
        {
          name,
          price: Number(price),
          seats: Number(seats),
          date: new Date(date).toISOString(),
          location,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("New production event node initialized successfully!");
      setShowModal(false);
      setName(""); setPrice(""); setSeats(""); setDate(""); setLocation("");
      fetchEvents();
    } catch (err) {
      const error = err as AxiosError<ServerError>;
      toast.error(error.response?.data?.message || "Event synchronization creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await api.delete(`/events/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Event cluster pruned cleanly from database indexes.");
      setShowConfirmDelete(null);
      fetchEvents();
    } catch (err) {
      const error = err as AxiosError<ServerError>;
      toast.error(error.response?.data?.message || "Pruning operation rejected by backend ledger.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-teal-400 font-mono animate-pulse">
        Mapping production event catalog indices...
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Events | Dashboard</title>
        <meta name="description" content="Configure scheduled properties, adjust variables, and track seat allocations inside the organizer matrix." />
      </Helmet>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Event Node Matrix</h1>
            <p className="text-sm text-slate-400 mt-1">Configure scheduled properties, adjust variables, and track seat allocations.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center space-x-2 transition"
          >
            <Plus size={16} />
            <span>Provision New Event</span>
          </button>
        </div>

        {events.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl p-16 text-center text-slate-500">
            <Calendar size={40} className="mx-auto mb-4 text-slate-700" />
            <p className="text-sm font-semibold">No operational event entries found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base text-white line-clamp-1">{ev.name}</h3>
                    <button
                      onClick={() => setShowConfirmDelete(ev.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-500 flex items-center space-x-1">
                    <Landmark size={12} /> <span>{ev.location}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    {new Date(ev.date).toLocaleDateString(undefined, { dateStyle: "long" })}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-medium">Pricing Threshold</span>
                    <span className="font-bold text-teal-400 font-mono">IDR {(ev.price ?? 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-medium">Availability Vector</span>
                    <span className="font-bold text-slate-200 font-mono">{ev.availableSeats} / {ev.seats} Left</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-white relative space-y-4">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X size={18} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-teal-400">Initialize Event Stream</h2>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Event Descriptive Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 text-xs focus:outline-none focus:border-teal-500" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Base Cost (IDR)</label>
                    <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 text-xs focus:outline-none focus:border-teal-500" required />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-semibold">Total Floor Capacity</label>
                    <input type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 text-xs focus:outline-none focus:border-teal-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Calendar Date Node</label>
                  <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 text-xs focus:outline-none focus:border-teal-500" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Physical Location Target</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 text-xs focus:outline-none focus:border-teal-500" required />
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded text-xs transition mt-2 disabled:opacity-50">
                  {submitting ? "Pushing ledger block state..." : "Broadcast Event Configuration"}
                </button>
              </form>
            </div>
          </div>
        )}

        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 max-w-sm w-full p-6 rounded-xl text-white text-center space-y-4">
              <div className="mx-auto bg-rose-500/10 text-rose-400 w-12 h-12 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Execute Pruning Operation?</h3>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setShowConfirmDelete(null)} className="w-1/2 bg-slate-800 hover:bg-slate-700 py-2 rounded font-semibold text-xs transition">
                  Abort
                </button>
                <button onClick={() => handleDeleteEvent(showConfirmDelete)} className="w-1/2 bg-rose-600 hover:bg-rose-500 py-2 rounded font-semibold text-xs transition">
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}