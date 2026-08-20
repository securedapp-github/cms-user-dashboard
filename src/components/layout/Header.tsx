import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react';
import useSWR from 'swr';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { userApi } from '../../services/api/userApi';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch top 5 logs
  const { data: logsData, isLoading: isLoadingLogs } = useSWR(
    isAuthenticated ? 'user/logs/top5' : null,
    () => userApi.getLogs(5),
    { refreshInterval: 10000 }
  );

  const logs = logsData?.logs || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatLogTitle = (action: string) => {
    return t(`logs.${action}`, action.replace(/_/g, ' '));
  };

  const formatLogDesc = (log: any) => {
    const action = log.action;
    const metadata = log.metadata || {};
    
    switch (action) {
      case 'USER_LOGIN':
        return t('logs.desc.USER_LOGIN', { method: metadata.method?.toUpperCase() || 'Portal' });
      case 'LANGUAGE_UPDATED':
        return t('logs.desc.LANGUAGE_UPDATED', { language: metadata.language || 'English' });
      case 'CONSENT_GRANTED':
        return t('logs.desc.CONSENT_GRANTED', { purpose: metadata.purpose_name || t('common.unknown') });
      case 'CONSENT_WITHDRAWN':
        return t('logs.desc.CONSENT_WITHDRAWN', { purpose: metadata.purpose_name || t('common.unknown') });
      case 'DSR_CREATED':
        return t('logs.desc.DSR_CREATED', { type: metadata.request_type || t('common.unknown') });
      case 'GRIEVANCE_CREATED':
        return t('logs.desc.GRIEVANCE_CREATED', { category: metadata.category || t('common.unknown') });
      default:
        return t('logs.desc.system', 'System activity log event');
    }
  };

  // Calculate initials from email or fallback
  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'US';
  
  const displayName = user?.email || t('auth.authenticated_user', 'Authenticated User');

  const handleLogout = () => {
    logout();
    addToast(t('auth.logout_success', 'Logged out successfully'), 'success');
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
            aria-label={t('common.toggle_menu', 'Toggle menu')}
          >
            <Menu size={20} />
          </button>
          
          <div className="min-w-0">
            {/* Page title removed as requested */}
          </div>
        </div>

        {/* Right: search + notif + avatar */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-all cursor-pointer"
              aria-label={t('nav.notifications', 'Notifications')}
            >
              <Bell size={18} />
              {/* Red dot */}
              {logs.length > 0 && (
                <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-[#ef4444] rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {/* Dropdown Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-[#e2e8f0] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 pb-2 border-b border-[#f1f5f9] flex justify-between items-center">
                  <span className="font-bold text-sm text-[#0f172a]">{t('dashboard.recent_activity', 'Recent Activity')}</span>
                  <button 
                    onClick={() => { setIsNotifOpen(false); navigate('/profile'); }}
                    className="text-xs font-semibold text-[#4f46e5] hover:underline"
                  >
                    {t('common.view_all', 'View All')}
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto px-2 pt-2 divide-y divide-[#f8fafc]">
                  {isLoadingLogs ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="w-5 h-5 border-2 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#94a3b8]">
                      {t('profile.no_logs', 'No activity yet')}
                    </div>
                  ) : (
                    logs.map((log: any) => (
                      <div key={log.id} className="p-2.5 hover:bg-[#f8fafc] rounded-xl transition-all duration-200 text-start group">
                        <div className="flex justify-between items-start gap-1 mb-0.5">
                          <span className="font-semibold text-xs text-[#0f172a] group-hover:text-[#4f46e5] transition-colors">
                            {formatLogTitle(log.action)}
                          </span>
                          <span className="text-[9px] text-[#94a3b8] whitespace-nowrap">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748b] line-clamp-2 leading-relaxed">
                          {formatLogDesc(log)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-[#e2e8f0] mx-1" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#64748b] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-all cursor-pointer"
            title={t('nav.logout')}
          >
            <LogOut size={18} />
          </button>

          {/* Avatar / User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 ps-1 pe-2 py-1 rounded-full hover:bg-[#f8fafc] transition-all group cursor-pointer"
              aria-label={t('nav.profile', 'Profile')}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] shadow-sm flex items-center justify-center shrink-0 text-white">
                <span className="text-xs font-bold">{initials}</span>
              </div>
              <div className="hidden md:flex flex-col items-start text-start">
                <span className="text-[13px] font-semibold text-[#0f172a] leading-tight truncate max-w-[120px]">{displayName}</span>
                <span className="text-[11px] text-[#94a3b8]">{t('profile.principal', 'Principal')}</span>
              </div>
              <ChevronDown size={13} className="hidden md:block text-[#94a3b8] group-hover:text-[#0f172a] transition-colors" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-[#e2e8f0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-[#f1f5f9]">
                  <p className="text-xs text-[#94a3b8] uppercase tracking-widest font-semibold">Account</p>
                  <p className="text-sm font-semibold text-[#0f172a] truncate mt-1">{displayName}</p>
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f8fafc] transition-colors text-sm text-[#0f172a] font-medium cursor-pointer"
                >
                  {t('nav.view_profile', 'View Profile')}
                </button>
                <div className="border-t border-[#f1f5f9] mt-2 pt-2">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#fef2f2] transition-colors text-sm text-[#ef4444] font-medium cursor-pointer"
                  >
                    {t('nav.logout', 'Logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
