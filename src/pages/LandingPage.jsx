import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Search, 
  FlaskConical, 
  Users, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  FileCheck, 
  GitBranch, 
  TrendingUp,
  Sparkles,
  School
} from 'lucide-react';

export function LandingPage() {
  const { user, login, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleDemoStudentLogin = async () => {
    try {
      await login('student@hypothesisgate.edu', 'student123');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  const handleDemoMentorLogin = async () => {
    try {
      await login('mentor@hypothesisgate.edu', 'mentor123');
      navigate('/mentor/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-frost text-charcoal-800">
      {/* Top Banner Navigation */}
      <nav className="border-b border-charcoal-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-charcoal-900">
              Hypothesis<span className="text-brand-600">Gate</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={isStudent ? '/dashboard' : '/mentor/dashboard'}
                className="inline-flex items-center gap-2 text-sm font-bold bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700 transition-all shadow-sm shadow-brand-500/25"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-charcoal-700 hover:text-brand-600 px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700 transition-all shadow-sm shadow-brand-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-charcoal-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.12),rgba(255,255,255,0))] -z-10" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.15] mb-6">
            Research Idea Validation & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-accent-600 bg-clip-text text-transparent">
              Mentor Collaboration Platform
            </span>
          </h1>

          <p className="text-base sm:text-lg text-charcoal-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Hypothesis Gate transforms raw student proposals into rigorous, evidence-backed projects. 
            Search real peer-reviewed papers via OpenAlex, run 5-dimension rubric validation, match with specialized faculty mentors, and record falsifiable experiments in the Hypothesis Lab.
          </p>

          {/* Quick Demo Launchers */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
            <button
              onClick={handleDemoStudentLogin}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02]"
            >
              <School className="w-4 h-4" /> Try Student Demo (Aarav)
            </button>
            <button
              onClick={handleDemoMentorLogin}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-charcoal-50 text-charcoal-800 font-bold text-sm border border-charcoal-300 shadow-sm transition-all hover:scale-[1.02]"
            >
              <Users className="w-4 h-4 text-accent-600" /> Try Mentor Demo (Dr. Jenkins)
            </button>
          </div>

          {/* Metric Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-charcoal-200/80 shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-brand-600">5 Dimensions</div>
              <div className="text-xs font-semibold text-charcoal-500 mt-0.5">Rules-Based Validation Rubric</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-charcoal-200/80 shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-accent-600">OpenAlex API</div>
              <div className="text-xs font-semibold text-charcoal-500 mt-0.5">Real Academic Papers Search</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-charcoal-200/80 shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">Weighted Match</div>
              <div className="text-xs font-semibold text-charcoal-500 mt-0.5">Domain, Skills & Experience</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-charcoal-200/80 shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-charcoal-800">PDF Dossier</div>
              <div className="text-xs font-semibold text-charcoal-500 mt-0.5">Instant Formal Report Export</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Stage Workflow Section */}
      <section className="py-16 bg-white border-b border-charcoal-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Complete End-to-End Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-3">
              How Hypothesis Gate Works
            </h2>
            <p className="text-sm text-charcoal-500 mt-2">
              Every stage is unified and stored in MySQL, providing an unalterable history of the student's research evolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-frost border border-charcoal-200 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm mb-3">1</div>
              <h3 className="font-bold text-charcoal-900 mb-1">Structured Idea Submission</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Students articulate problem statements, existing system limitations, proposed architecture, objectives, and initial hypotheses.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-frost border border-charcoal-200 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm mb-3">2</div>
              <h3 className="font-bold text-charcoal-900 mb-1">OpenAlex Literature Search</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Connects to the OpenAlex research repository. Reconstructs abstracts, compares keywords, and extracts research questions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-frost border border-charcoal-200 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm mb-3">3</div>
              <h3 className="font-bold text-charcoal-900 mb-1">5-Dimension Evidence Validation</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Evaluates Problem Clarity, Research Support, Originality, Feasibility, and Testability with transparent improvement tips.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-frost border border-charcoal-200 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm mb-3">4</div>
              <h3 className="font-bold text-charcoal-900 mb-1">Project-Based Mentor Matching</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Weighted algorithm: Domain (30%), Skills (25%), Interests (20%), Experience (15%), Availability (10%) with capacity safeguards.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-frost border border-charcoal-200 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm mb-3">5</div>
              <h3 className="font-bold text-charcoal-900 mb-1">Faculty Review & Revisions</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Assigned faculty review literature citations, validation scores, provide structured critiques, and approve proposals to advance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-frost border border-charcoal-200 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm mb-3">6</div>
              <h3 className="font-bold text-charcoal-900 mb-1">Hypothesis Lab & Experimentation</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Students log procedures, quantitative metrics, charts, and outcomes (Supported, Not Supported, Inconclusive) with mentor review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-frost border-t border-charcoal-200 text-center text-xs text-charcoal-500">
        <p className="font-medium">
          Hypothesis Gate — College Mini Project in Full-Stack Web Development & Research Systems
        </p>
        <p className="mt-1 text-charcoal-400">
          Built with React, Vite, Tailwind CSS, Node.js, Express, and MySQL.
        </p>
      </footer>
    </div>
  );
}
