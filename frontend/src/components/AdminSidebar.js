import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Squares2X2Icon,
  CubeIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  ChatBubbleBottomCenterTextIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const defaultItems = [
  { label: 'Overview', icon: Squares2X2Icon },
  { label: 'Assets', icon: CubeIcon },
  { label: 'Assignments', icon: ClipboardDocumentListIcon },
  { label: 'Tickets', icon: TicketIcon },
  { label: 'Lost & Found', icon: ExclamationTriangleIcon },
  { label: 'Chat', icon: ChatBubbleBottomCenterTextIcon },
  { label: 'Users', icon: UsersIcon },
  { label: 'Settings', icon: Cog6ToothIcon },
];

const routeMap = {
  Overview: '/admin-dashboard',
  Assets: '/admin-assets',
  Assignments: '/admin-assignments',
  Tickets: '/admin-tickets',
  'Lost & Found': '/admin-lost',
  Chat: '/admin-chat',
  Users: '/admin-users',
  Settings: '/admin-settings',
};

const AdminSidebar = ({ active = 'Overview', items = defaultItems, onSelect }) => {
  const useSelect = typeof onSelect === 'function';
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mr-2">
          360°
        </div>
        <span className="font-semibold text-gray-900 text-sm">ThreeSixty</span>
      </div>

      <nav className="flex-1 px-3 pt-4 text-sm space-y-1">
        {items.map((item) => {
          const to = routeMap[item.label] || '/admin-dashboard';
          if (useSelect) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelect(item.label)}
                className={`w-full flex items-center px-3 py-2 rounded-lg ${
                  item.label === active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </button>
            );
          }
          return (
            <NavLink
              key={item.label}
              to={to}
              className={({ isActive }) =>
                `w-full flex items-center px-3 py-2 rounded-lg ${
                  isActive || item.label === active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
