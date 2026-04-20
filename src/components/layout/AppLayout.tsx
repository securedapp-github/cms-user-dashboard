import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../services/api/userApi';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, setAuthenticated, logout, setLanguage } = useAuthStore();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('user_token');
      
      if (!token) {
        setIsInitializing(false);
        if (!['/login', '/signup'].includes(location.pathname)) {
          navigate('/login');
        }
        return;
      }

      try {
        // Fetch user and settings in parallel
        const [meRes, settingsRes] = await Promise.all([
          !isAuthenticated ? userApi.getUser() : Promise.resolve(null),
          userApi.getSettings()
        ]);

        if (meRes && (meRes.principal_id || meRes.id)) {
          setAuthenticated(meRes);
        }

        // Initialize Language — always re-apply from backend to honour saved preferences
        const backendLang = settingsRes?.preferred_language;
        if (backendLang) {
          setLanguage(backendLang);
          if (i18n.language !== backendLang) {
            i18n.changeLanguage(backendLang);
          }
        }

      } catch (error) {
        console.error("Session restoration failed:", error);
        logout();
        navigate('/login');
      }
      setIsInitializing(false);
    };

    // Only run if not already initializing
    initSession();
    
    // Remove location.pathname from dependencies to stop re-running on navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, logout]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f46e5]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 md:ms-[260px]">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden p-5 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      <ToastContainer />
      
    </div>
  );
}
