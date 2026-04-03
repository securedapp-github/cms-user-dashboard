import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  MessageSquare, 
  User, 
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import logo from '../../assets/STRIGHT.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navItems = [
    { name: 'Overview',        path: '/',          icon: <LayoutDashboard size={18} />,  end: true },
    { name: 'My Consents',     path: '/consents',  icon: <ShieldCheck size={18} /> },
    { name: 'DSR Management',  path: '/dsr',       icon: <FileText size={18} /> },
    { name: 'Grievance System',path: '/grievance', icon: <AlertCircle size={18} /> },
    { name: 'Feedback',        path: '/feedback',  icon: <MessageSquare size={18} /> },
    { name: 'Profile',         path: '/profile',   icon: <User size={18} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col",
          "bg-white border-r border-[#f1f5f9]",
          "shadow-[4px_0_24px_rgba(0,0,0,0.06)]",
          "transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-1 shrink-0">
          <div className="flex items-center -mt-12 -mb-12 pointer-events-none">
            <img 
              src={logo} 
              alt="Stright Logo" 
              className="h-40 w-auto object-contain drop-shadow-sm" 
            />
          </div>
          <button 
            onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-full text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-[#f1f5f9] mb-3" />

        {/* Nav section label */}
        <p className="px-5 text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase mb-2">
          Main Menu
        </p>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-medium",
                "transition-all duration-200 group relative",
                isActive 
                  ? [
                      "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white",
                      "shadow-[0_4px_14px_rgba(79,70,229,0.30)]",
                    ].join(' ')
                  : [
                      "text-[#64748b]",
                      "hover:bg-[#f8fafc] hover:text-[#0f172a]",
                      "hover:translate-x-1",
                    ].join(' ')
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    "w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 transition-all duration-200",
                    isActive 
                      ? "bg-white/20 text-white"
                      : "bg-[#f1f5f9] text-[#64748b] group-hover:bg-[#eef2ff] group-hover:text-[#4f46e5]"
                  )}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom logout */}
        <div className="p-3 border-t border-[#f1f5f9] shrink-0">
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-[#ef4444] hover:bg-[#fef2f2] transition-all duration-200 group"
          >
            <span className="w-8 h-8 rounded-[8px] bg-[#fef2f2] flex items-center justify-center text-[#ef4444] group-hover:bg-[#fee2e2] transition-all shrink-0">
              <LogOut size={16} />
            </span>
            <span>Logout</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
