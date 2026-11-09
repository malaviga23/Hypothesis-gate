import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, School, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('National Institute of Technology');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [expertise, setExpertise] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register({
        role,
        name,
        email,
        password,
        institution,
        department,
        expertise: role === 'mentor' ? expertise : '',
        skills: role === 'mentor' ? skills : '',
        experience_years: role === 'mentor' ? parseInt(experienceYears, 10) : 0
      });

      if (user.role === 'mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-frost flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-charcoal-900">
            Hypothesis<span className="text-brand-600">Gate</span>
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
          Create Your Academic Account
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          Join the platform as a student researcher or faculty mentor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-charcoal-200/80 rounded-2xl">
          {/* Role Switcher Tabs */}
          <div className="flex p-1 bg-frost rounded-xl border border-charcoal-200 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Student Researcher
            </button>
            <button
              type="button"
              onClick={() => setRole('mentor')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'mentor'
                  ? 'bg-accent-600 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Faculty Mentor
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. Aarav Sharma' : 'e.g. Dr. Sarah Jenkins'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                  />
                </div>
              </div>

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
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Academic Institution
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="College or Institute Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Department / Program
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Mentor Specific Fields */}
            {role === 'mentor' && (
              <div className="space-y-4 pt-2 border-t border-charcoal-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                      Primary Expertise Domains
                    </label>
                    <input
                      type="text"
                      required
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="e.g. AI, Healthcare, Edge Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                      Mentorship Experience (Years)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    Technical Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. PyTorch, Python, Docker, Kubernetes, React"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 ${
                role === 'student' ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25' : 'bg-accent-600 hover:bg-accent-700 shadow-accent-500/25'
              }`}
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'student' ? 'Student' : 'Faculty Mentor'}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-charcoal-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
