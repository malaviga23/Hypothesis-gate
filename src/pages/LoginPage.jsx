import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-frost flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-charcoal-900">
            Hypothesis<span className="text-brand-600">Gate</span>
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          Access research proposals, peer validation, and mentor reviews
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:px-10 shadow-sm border border-charcoal-200/80 rounded-2xl">
          {/* Demo Quick Fill Badges */}
          <div className="mb-6 p-3 bg-brand-50/70 border border-brand-200/70 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-600" /> Demo Credentials Quick-Fill:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student@hypothesisgate.edu', 'student123')}
                className="text-left p-2 rounded-lg bg-white border border-brand-200 hover:border-brand-400 text-xs text-charcoal-800 transition-colors shadow-2xs"
              >
                <div className="font-bold text-brand-700">Student Demo</div>
                <div className="text-[11px] text-charcoal-500 truncate">Aarav Sharma</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('mentor@hypothesisgate.edu', 'mentor123')}
                className="text-left p-2 rounded-lg bg-white border border-accent-200 hover:border-accent-400 text-xs text-charcoal-800 transition-colors shadow-2xs"
              >
                <div className="font-bold text-accent-700">Mentor Demo</div>
                <div className="text-[11px] text-charcoal-500 truncate">Dr. S. Jenkins</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-charcoal-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
