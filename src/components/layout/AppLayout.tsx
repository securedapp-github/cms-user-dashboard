import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../services/api/userApi';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, setAuthenticated, logout } = useAuthStore();
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

      if (!isAuthenticated) {
        try {
          const res = await userApi.getUser();
          if (res && (res.principal_id || res.id)) {
            setAuthenticated(res);
          } else {
            throw new Error("Invalid session");
          }
        } catch (error) {
          console.error("Session restoration failed:", error);
          logout();
          navigate('/login');
        }
      }
      setIsInitializing(false);
    };

    initSession();
  }, [isAuthenticated, setAuthenticated, logout, navigate, location.pathname]);

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

      <div className="flex-1 flex flex-col min-w-0 md:ml-[260px]">
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
