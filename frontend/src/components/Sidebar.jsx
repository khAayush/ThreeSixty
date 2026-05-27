import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router';
import {
  Squares2X2Icon, CubeIcon, ClipboardDocumentCheckIcon,
  TicketIcon, MagnifyingGlassIcon, ChatBubbleLeftEllipsisIcon,
  UsersIcon, Cog6ToothIcon, XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useChat } from '../contexts/ChatContext';

const navItems = [
  { id: 'overview-admin', label: 'Overview', icon: Squares2X2Icon, path: '/admin-dashboard', roles: ['admin', 'manager'] },
  { id: 'overview-employee', label: 'Overview', icon: Squares2X2Icon, path: '/employee-dashboard', roles: ['employee'] },

  { id: 'assets-admin', label: 'Assets', icon: CubeIcon, path: '/assets', roles: ['admin', 'manager'] },
  { id: 'assets-employee', label: ' My Assets', icon: CubeIcon, path: '/my-assets', roles: ['employee'] },

  { id: 'assignments-admin', label: 'Assignments', icon: ClipboardDocumentCheckIcon, path: '/assignments', roles: ['admin', 'manager'] },
  { id: 'assignments-employee', label: 'Request Asset', icon: PlusIcon, path: '/request-asset', roles: ['employee'] },

  { id: 'tickets-admin', label: 'Tickets', icon: TicketIcon, path: '/tickets', roles: ['admin', 'manager'] },
  { id: 'tickets-employee', label: 'Tickets', icon: TicketIcon, path: '/my-tickets', roles: ['employee'] },

  { id: 'lost-found-admin', label: 'Lost & Found', icon: MagnifyingGlassIcon, path: '/lost-found', roles: ['admin', 'manager'] },
  { id: 'lost-found-employee', label: 'Lost & Found', icon: MagnifyingGlassIcon, path: '/my-lost-found', roles: ['employee'] },

  { id: 'chat', label: 'Chat', icon: ChatBubbleLeftEllipsisIcon, path: '/chat', roles: ['admin', 'manager', 'employee'] },

  { id: 'users', label: 'Users', icon: UsersIcon, path: '/users', roles: ['admin', 'manager'] },

  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, path: '/settings', roles: ['manager'] },
];

const Sidebar = ({ isOpen, onClose }) => {
  const [userRole, setUserRole] = useState("");
  const { conversations } = useChat();
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUserRole(userData.role || "Employee");
      } catch (err) {
        console.error("Error parsing user role:", err);
      }
    }
  }, []);

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:h-screen lg:sticky lg:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="flex items-center justify-between mb-10 px-2 py-2">
          <Link
            to={userRole === "employee" ? "/employee-dashboard" : "/admin-dashboard"}
            className="flex items-center space-x-3"
          >
            <div className="bg-brand p-2 rounded-xl shadow-lg shadow-brand/20">
              <Squares2X2Icon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight italic">
              Three<span className="text-brand">Sixty</span>
            </h1>
          </Link>
          
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => `
                w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-brand/10 text-brand shadow-sm shadow-brand/5' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-brand' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span className={`text-sm flex-1 ${isActive ? 'font-bold' : 'font-semibold'}`}>
                    {item.label}
                  </span>
                  {item.id === 'chat' && totalUnread > 0 && (
                    <span className="shrink-0 flex items-center justify-center min-w-5 h-5 text-[10px] font-bold text-white bg-brand rounded-full px-1 leading-none">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 px-2">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            Copyright &copy; 2026 ThreeSixty
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;