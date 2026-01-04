import React from "react";
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
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const users = [
  {
    initials: "JA",
    name: "John Administrator",
    email: "john.admin@techcorp.com",
    role: "Admin",
    joined: "Jan 10, 2024",
    status: "active",
  },
  {
    initials: "SJ",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    role: "Employee",
    joined: "Jan 20, 2024",
    status: "active",
  },
  {
    initials: "MC",
    name: "Michael Chen",
    email: "michael.chen@techcorp.com",
    role: "Employee",
    joined: "Feb 15, 2024",
    status: "active",
  },
  {
    initials: "ED",
    name: "Emma Davis",
    email: "emma.davis@techcorp.com",
    role: "Employee",
    joined: "Mar 5, 2024",
    status: "active",
  },
  {
    initials: "JW",
    name: "Jessica Williams",
    email: "jessica.williams@techcorp.com",
    role: "Employee",
    joined: "Apr 12, 2024",
    status: "active",
  },
  {
    initials: "DP",
    name: "David Park",
    email: "david.park@techcorp.com",
    role: "Employee",
    joined: "May 20, 2024",
    status: "active",
  },
  {
    initials: "AF",
    name: "Amanda Foster",
    email: "amanda.foster@techcorp.com",
    role: "Employee",
    joined: "Jun 8, 2024",
    status: "active",
  },
];

const UsersPage = () => {
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
          {[
            { label: "Overview", icon: Squares2X2Icon },
            { label: "Assets", icon: CubeIcon },
            { label: "Categories", icon: FolderIcon },
            { label: "Assignments", icon: ClipboardDocumentListIcon },
            { label: "Tickets", icon: TicketIcon },
            { label: "Lost & Found", icon: ExclamationTriangleIcon },
            { label: "Chat", icon: ChatBubbleBottomCenterTextIcon },
            { label: "Users", icon: UsersIcon },
            { label: "Settings", icon: Cog6ToothIcon },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center px-3 py-2 rounded-lg ${
                item.label === "Users"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main column */}
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

        {/* Content */}
        <main className="flex-1 px-8 py-6 space-y-5">
          {/* Header + action */}
          <section className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Users</h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage users in your organization
              </p>
            </div>
            <button className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700">
              <span className="mr-1.5 text-base">+</span>
              Invite User
            </button>
          </section>

          {/* Summary cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Users"
              value={7}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              label="Admins"
              value={1}
              iconBg="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              label="Employees"
              value={6}
              iconBg="bg-green-50"
              iconColor="text-green-500"
            />
          </section>

          {/* Users table */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Join Date</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.email}>
                      {/* User */}
                      <td className="py-2 pr-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px] font-semibold">
                            {u.initials}
                          </div>
                          <span className="text-sm text-gray-900">
                            {u.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-2 pr-4 text-gray-500">{u.email}</td>

                      {/* Role dropdown (visual only) */}
                      <td className="py-2 pr-4">
                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-700">
                          <span>{u.role}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4 ml-1 text-gray-400"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </td>

                      {/* Join date */}
                      <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">
                        {u.joined}
                      </td>

                      {/* Status */}
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-[11px] text-green-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                          {u.status}
                        </span>
                      </td>

                      {/* Actions (placeholder) */}
                      <td className="py-2 pr-2 text-right">
                        <button className="px-2 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50">
                          •••
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconBg}`}
    >
      <UserGroupIcon className={`w-5 h-5 ${iconColor}`} />
    </div>
  </div>
);

export default UsersPage;
