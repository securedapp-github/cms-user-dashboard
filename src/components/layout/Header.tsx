import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  
  // Calculate initials from email or fallback
  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'US';
  
  const displayName = user?.email || 'Authenticated User';

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#f1f5f9]">
      <div className="flex h-[60px] items-center justify-between px-5 sm:px-6 lg:px-8 gap-4">
        
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-[10px] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-all -ml-1"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="min-w-0">
            {/* Page title removed as requested */}
          </div>
        </div>

        {/* Right: search + notif + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search pill — desktop only */}
          <div className="hidden lg:flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-full px-4 py-2 text-sm text-[#94a3b8] hover:border-[#cbd5e1] cursor-pointer transition-all w-48">
            <Search size={14} />
            <span>Quick search…</span>
          </div>

          {/* Notifications */}
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-all"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {/* Red dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full border-2 border-white" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[#e2e8f0] mx-1" />

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#64748b] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>

          {/* Avatar / User */}
          <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-[#f8fafc] transition-all group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] shadow-sm flex items-center justify-center shrink-0 text-white">
              <span className="text-xs font-bold">{initials}</span>
            </div>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-[13px] font-semibold text-[#0f172a] leading-tight truncate max-w-[120px]">{displayName}</span>
              <span className="text-[11px] text-[#94a3b8]">Principal</span>
            </div>
            <ChevronDown size={13} className="hidden md:block text-[#94a3b8] group-hover:text-[#0f172a] transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
