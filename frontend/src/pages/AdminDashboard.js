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
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex bg-[#f5f7fb] text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mr-2">
            360°
          </div>
          <span className="font-semibold text-gray-900 text-sm">
            ThreeSixty
          </span>
        </div>

        {/* Nav with Heroicons */}
        <nav className="flex-1 px-3 pt-4 text-sm">
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
          ].map((item, idx) => (
            <button
              key={item.label}
              className={`w-full flex items-center px-3 py-2 rounded-lg mb-1 ${
                idx === 0
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
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
        <main className="flex-1 px-8 py-6 space-y-6">
          {/* Header */}
          <section>
            <h1 className="text-sm font-semibold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Monitor your organization&apos;s assets and requests
            </p>
          </section>

          {/* Stat cards row 1 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Total Assets",
                value: 10,
                iconBg: "bg-blue-50",
                Icon: CubeIcon,
                iconColor: "text-blue-500",
              },
              {
                label: "In Stock",
                value: 3,
                iconBg: "bg-green-50",
                Icon: CheckCircleIcon,
                iconColor: "text-green-500",
              },
              {
                label: "Assigned",
                value: 5,
                iconBg: "bg-purple-50",
                Icon: CubeIcon,
                iconColor: "text-purple-500",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.iconBg}`}
                >
                  <card.Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            ))}
          </section>

          {/* Stat cards row 2 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Damaged/In Repair",
                value: 2,
                iconBg: "bg-red-50",
                Icon: ExclamationTriangleIcon,
                iconColor: "text-red-500",
              },
              {
                label: "Open Tickets",
                value: 3,
                iconBg: "bg-yellow-50",
                Icon: TicketIcon,
                iconColor: "text-yellow-500",
              },
              {
                label: "Pending Requests",
                value: 3,
                iconBg: "bg-orange-50",
                Icon: ClockIcon,
                iconColor: "text-orange-500",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.iconBg}`}
                >
                  <card.Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            ))}
          </section>

          {/* Pending asset requests table */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Pending Asset Requests
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">Employee</th>
                    <th className="py-2 pr-4">Requested Item</th>
                    <th className="py-2 pr-4">Reason</th>
                    <th className="py-2 pr-4 whitespace-nowrap">
                      Request Date
                    </th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      name: "Jessica Williams",
                      item: "Laptops",
                      reason:
                        "Need laptop for new project work - current one is outdated.",
                      date: "Dec 12, 4:15 PM",
                    },
                    {
                      name: "David Park",
                      item: "Monitors",
                      reason: "Additional monitor for dual-screen setup",
                      date: "Dec 13, 8:00 PM",
                    },
                    {
                      name: "Amanda Foster",
                      item: "Mobile Devices",
                      reason: "Company phone for client communications",
                      date: "Dec 13, 2:45 PM",
                    },
                  ].map((row) => (
                    <tr key={row.name}>
                      <td className="py-2 pr-4 text-gray-800">{row.name}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-[11px] text-blue-600">
                          {row.item}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-500 text-xs">
                        {row.reason}
                      </td>
                      <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 text-xs hover:bg-gray-50">
                            View
                          </button>
                          <button className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 text-xs hover:bg-gray-50 flex items-center space-x-1">
                            <span>✕</span>
                            <span>Deny</span>
                          </button>
                          <button className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs hover:bg-blue-700">
                            Approve
                          </button>
                        </div>
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

export default AdminDashboard;
