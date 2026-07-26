import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PlusCircle } from 'lucide-react';
import useAuthStore from '../stores/authStore';

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useAuthStore();
  const isOrganizer = user?.role === 'ORGANIZER';

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsOpen(false);
    navigate('/login');
  };

  const liquidGlassStyle =
    "bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-[40px] backdrop-saturate-[180%] border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]";

  const linkClass = (path: string) =>
    `text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 py-2 ${
      isActive(path) ? 'text-luxury-gold' : 'text-slate-300 hover:text-white'
    }`;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 ${liquidGlassStyle} px-4 sm:px-8 py-3 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-white font-black tracking-[0.15em] text-xs sm:text-sm">
          <img
            src="/logo.webp"
            alt="Eventura Logo"
            className="h-8 w-auto object-contain brightness-110"
            loading="eager"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={linkClass(link.path)}>
              {link.name}
            </Link>
          ))}

          {isLoggedIn && isOrganizer && (
            <Link
              to="/dashboard/events/create"
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-3.5 py-2 rounded-lg border transition-all ${
                isActive('/dashboard/events/create')
                  ? 'bg-luxury-gold text-eventura-dark border-luxury-gold'
                  : 'border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold/10'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </Link>
          )}

          {isLoggedIn && isOrganizer && (
            <Link to="/dashboard" className={linkClass('/dashboard')}>
              Dashboard
            </Link>
          )}

          {isLoggedIn && (
            <Link to="/profile" className={linkClass('/profile')}>
              Profile
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="cursor-pointer text-[10px] uppercase tracking-[0.25em] text-red-500 hover:text-red-400 transition-colors duration-300 font-bold"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className={linkClass('/login')}>
                Login
              </Link>
              <Link
                to="/register"
                className="bg-luxury-gold hover:bg-luxury-gold-light text-eventura-dark font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-lg transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-300 hover:text-white transition-colors p-1"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-eventura-dark/95 border-b border-white/8 backdrop-blur-2xl flex flex-col p-6 space-y-4 shadow-2xl transition-all">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={linkClass(link.path)}
            >
              {link.name}
            </Link>
          ))}

          {isLoggedIn && isOrganizer && (
            <Link
              to="/dashboard/events/create"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 bg-luxury-gold text-eventura-dark font-bold text-[10px] uppercase tracking-[0.2em] py-3 rounded-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
          )}

          {isLoggedIn && isOrganizer && (
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={linkClass('/dashboard')}
            >
              Dashboard
            </Link>
          )}

          {isLoggedIn && (
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={linkClass('/profile')}
            >
              Profile
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="cursor-pointer text-[10px] text-left uppercase tracking-[0.25em] text-red-500 font-bold pt-2"
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col space-y-3 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className={linkClass('/login')}>
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="bg-luxury-gold text-eventura-dark text-center font-bold text-[10px] uppercase tracking-[0.2em] py-3 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;