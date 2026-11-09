import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, User, Menu } from 'lucide-react';
import { Badge } from './Badge';

export function Navbar({ onMobileMenuToggle }) {
  const { user, logout, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-charcoal-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg text-charcoal-500 hover:bg-charcoal-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link to={user ? (isStudent ? '/dashboard' : '/mentor/dashboard') : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-charcoal-900 flex items-center gap-1.5">
                Hypothesis<span className="text-brand-600 font-black">Gate</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Right side user info */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <Badge variant={isStudent ? 'brand' : 'violet'} size="md">
              {isStudent ? 'Student Scholar' : 'Research Mentor'}
            </Badge>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-charcoal-900 leading-tight">{user.name}</span>
              <span className="text-[11px] text-charcoal-500 truncate max-w-[180px]">{user.institution || 'NIT'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-charcoal-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-charcoal-200/60"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-charcoal-700 hover:text-brand-600 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs sm:text-sm font-semibold bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700 shadow-sm transition-all shadow-brand-500/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
