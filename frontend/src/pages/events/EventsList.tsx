import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Calendar, Music, Ticket, Loader2 } from "lucide-react";
import { useEventStore } from "../../stores/eventStore";

export default function EventsList() {
  const { events, loading, error, fetchEvents } = useEventStore();
  const [selectedCity, setSelectedCity] = useState("All");

  const cities = ["All", "Bali", "Bandung", "Jakarta", "Surabaya", "Yogyakarta"];

  useEffect(() => {
    fetchEvents().catch((err) => console.error("Error fetching events:", err));
  }, [fetchEvents]);

  const filteredEvents = (events || []).filter((evt) => {
    if (selectedCity === "All") return true;
    return evt.location?.toLowerCase().includes(selectedCity.toLowerCase());
  });

  const cardGlassStyle =
    "bg-gradient-to-b from-white/[0.06] to-white/[0.01] backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]";

  return (
    <>
      <Helmet>
        <title>Concerts & Live Music | Eventura</title>
      </Helmet>

      <div className="min-h-screen bg-eventura-dark text-white pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wider uppercase text-white">
              LIVE <span className="text-amber-400">CONCERTS</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              Discover upcoming music concerts and live performances across major cities.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedCity === city
                    ? "bg-amber-400 text-eventura-dark shadow-lg shadow-amber-400/20"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-400 text-xs">
              Unable to load concerts: {error}. Showing cached or offline view.
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-slate-400 tracking-widest uppercase font-semibold">
                Loading live concerts...
              </p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`rounded-2xl overflow-hidden flex flex-col group ${cardGlassStyle}`}
                >
                  <div className="relative h-48 overflow-hidden bg-white/5">
                    <img
                      src={evt.imageUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop"}
                      alt={evt.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-eventura-dark/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase text-amber-400 flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      {evt.type || "Concert"}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col grow justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Promoter: {evt.user?.name || "Eventura Organizer"}
                      </p>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {evt.name}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {new Date(evt.date).toLocaleDateString() !== "Invalid Date"
                            ? new Date(evt.date).toLocaleDateString()
                            : evt.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="line-clamp-1">{evt.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                          Pass Price
                        </span>
                        <span className="text-sm font-bold text-amber-400">
                          {typeof evt.price === "number" ? `$${evt.price}` : evt.price}
                        </span>
                      </div>

                      <Link
                        to={`/checkout/${evt.id}`}
                        className="bg-white/10 hover:bg-amber-400 hover:text-eventura-dark text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        Buy Pass
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/2 rounded-2xl border border-white/5">
              <p className="text-slate-400 text-sm">No upcoming music concerts scheduled in {selectedCity}.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}