import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Ticket, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Eventura | Ultimate Music Concerts</title>
      </Helmet>

      <div className="min-h-screen bg-eventura-dark text-white pt-28 pb-16 px-4 sm:px-8 flex flex-col justify-center items-center relative overflow-hidden">
        
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 rounded-full text-amber-400 text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Live Music Experience
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-tight">
            FEEL THE RHYTHM OF <br />
            <span className="text-amber-400">UNFORGETTABLE CONCERTS</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Book passes for the hottest music concerts across Indonesia. Real-time availability, instant ticketing, and exclusive live events.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/events"
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-eventura-dark font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <Ticket className="w-4 h-4" />
              Explore Concerts
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};