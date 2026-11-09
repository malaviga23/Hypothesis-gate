import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Folders, 
  Inbox, 
  UserCheck, 
  UserCog, 

} from 'lucide-react';

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { isStudent, isMentor } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects/new', label: 'New Project Idea', icon: FolderPlus },
    { to: '/projects', label: 'My Projects', icon: Folders },
  ];

  const mentorLinks = [
    { to: '/mentor/dashboard', label: 'Mentor Hub', icon: LayoutDashboard },
    { to: '/mentor/requests', label: 'Incoming Requests', icon: Inbox },
    { to: '/mentor/projects', label: 'Assigned Projects', icon: UserCheck },
    { to: '/mentor/profile', label: 'Expertise & Capacity', icon: UserCog },
  ];

  const links = isStudent ? studentLinks : mentorLinks;

  const content = (
    <div className="flex flex-col h-full py-5 px-3">
      <div className="px-3 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
          {isStudent ? 'Student Workspace' : 'Faculty Workspace'}
        </span>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100/80'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>

      
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-charcoal-200/80 min-h-[calc(100vh-61px)] flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-10 flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
