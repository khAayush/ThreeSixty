import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, onLogout }) => {
  // State to track if the mobile sidebar is open
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* Sidebar gets the state and a function to close itself */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header gets a function to open the sidebar */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} onLogout={onLogout} />
        
        {/* The actual page content goes here */}
        <div className="flex-1">
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default Layout;