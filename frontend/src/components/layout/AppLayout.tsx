import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
