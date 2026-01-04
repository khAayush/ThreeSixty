// AdminLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Squares2X2Icon,
  CubeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  ChatBubbleBottomCenterTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { label: "Overview", icon: Squares2X2Icon, to: "/admin" },
  { label: "Assets", icon: CubeIcon, to: "/admin/assets" },
  { label: "Categories", icon: FolderIcon, to: "/admin/categories" },
  { label: "Assignments", icon: ClipboardDocumentListIcon, to: "/admin/assignments" },
  { label: "Tickets", icon: TicketIcon, to: "/admin/tickets" },
  { label: "Lost & Found", icon: ExclamationTriangleIcon, to: "/admin/lost-found" },
  { label: "Chat", icon: ChatBubbleBottomCenterTextIcon, to: "/admin/chat" },
  { label: "Users", icon: UsersIcon, to: "/admin/users" },
  { label: "Settings", icon: Cog6ToothIcon, to: "/admin/settings" },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#f5f7fb] text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mr-2">
            360°
          </div>
          <span className="font-semibold text-gray-900 text-sm">ThreeSixty</span>
        </div>

        <nav className="flex-1 px-3 pt-4 text-sm space-y-1">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                "w-full flex items-center px-3 py-2 rounded-lg " +
                (isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50")
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">ThreeSixty</span>
            <span className="text-gray-400">•</span>
            <span>Herald College Kathmandu</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <BellIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                SB
              </div>
              <span className="text-sm text-gray-700">Sabina Bharati</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
