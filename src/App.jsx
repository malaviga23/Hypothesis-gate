import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ProjectList } from './pages/student/ProjectList';
import { ProjectCreateEdit } from './pages/student/ProjectCreateEdit';
import { ProjectOverview } from './pages/student/ProjectOverview';
import { ResearchAnalysis } from './pages/student/ResearchAnalysis';
import { EvidenceValidation } from './pages/student/EvidenceValidation';
import { MentorMatching } from './pages/student/MentorMatching';
import { HypothesisLab } from './pages/student/HypothesisLab';
import { VersionHistory } from './pages/student/VersionHistory';
import { FinalReport } from './pages/student/FinalReport';

// Mentor Pages
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { IncomingRequests } from './pages/mentor/IncomingRequests';
import { AssignedProjects } from './pages/mentor/AssignedProjects';
import { MentorProfile } from './pages/mentor/MentorProfile';
import { ProjectReview } from './pages/mentor/ProjectReview';

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-frost flex items-center justify-center text-charcoal-400">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-frost flex flex-col">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
      <div className="flex flex-1">
        <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function RoleProtectedRoute({ allowedRole }) {
  const { user } = useAuth();
  if (user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'mentor' ? '/mentor/dashboard' : '/dashboard'} replace />;
  }
  return <Outlet />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Workspace */}
          <Route element={<AuthenticatedLayout />}>
            {/* Student Only Routes */}
            <Route element={<RoleProtectedRoute allowedRole="student" />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/new" element={<ProjectCreateEdit />} />
              <Route path="/projects/:id" element={<ProjectOverview />} />
              <Route path="/projects/:id/research" element={<ResearchAnalysis />} />
              <Route path="/projects/:id/validation" element={<EvidenceValidation />} />
              <Route path="/projects/:id/mentors" element={<MentorMatching />} />
              <Route path="/projects/:id/hypotheses" element={<HypothesisLab />} />
              <Route path="/projects/:id/versions" element={<VersionHistory />} />
              <Route path="/projects/:id/report" element={<FinalReport />} />
            </Route>

            {/* Mentor Only Routes */}
            <Route element={<RoleProtectedRoute allowedRole="mentor" />}>
              <Route path="/mentor/dashboard" element={<MentorDashboard />} />
              <Route path="/mentor/requests" element={<IncomingRequests />} />
              <Route path="/mentor/projects" element={<AssignedProjects />} />
              <Route path="/mentor/projects/:id/review" element={<ProjectReview />} />
              <Route path="/mentor/profile" element={<MentorProfile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
