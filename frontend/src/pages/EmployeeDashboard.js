import React from 'react';
import {
  Squares2X2Icon,
  CubeIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  BellIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen flex bg-[#f5f7fb] text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mr-2">
            360°
          </div>
          <span className="font-semibold text-gray-900 text-sm">ThreeSixty</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 text-sm space-y-1">
          {[
            { label: 'Overview', icon: Squares2X2Icon },
            { label: 'My Assets', icon: CubeIcon },
            { label: 'Request Asset', icon: ClipboardDocumentListIcon },
            { label: 'Tickets', icon: TicketIcon },
            { label: 'Lost & Found', icon: ExclamationTriangleIcon },
            { label: 'Admin Contacts', icon: UsersIcon },
            { label: 'Chat', icon: ChatBubbleBottomCenterTextIcon },
            { label: 'Settings', icon: Cog6ToothIcon },
          ].map((item, idx) => (
            <button
              key={item.label}
              className={`w-full flex items-center px-3 py-2 rounded-lg ${
                idx === 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
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
              <BellIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                SG
              </div>
              <span className="text-sm text-gray-700">Samip Gyawali</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-8 py-6 space-y-6">
          {/* Welcome + top cards */}
          <section className="space-y-4">
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Welcome back, Samip!</h1>
              <p className="text-xs text-gray-500 mt-1">
                Here&apos;s what&apos;s happening with your assets and requests
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TopStatCard label="My Assets" value="3" description="Currently assigned to you" />
              <TopStatCard label="Pending Requests" value="1" description="Awaiting approval" />
              <TopStatCard label="Open Tickets" value="1" description="Need attention" />
            </div>
          </section>

          {/* My Assets + Recent Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* My assets list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">My Assets</h2>
              <div className="space-y-3">
                {[
                  {
                    name: 'MacBook Pro 16" M3',
                    code: 'TC-LAP-001',
                  },
                  {
                    name: 'LG UltraWide 34"',
                    code: 'TC-MON-001',
                  },
                  {
                    name: 'Logitech MX Keys Mini',
                    code: 'TC-KEY-003',
                  },
                ].map((asset) => (
                  <div
                    key={asset.code}
                    className="flex items-center justify-between bg-[#f7f9ff] rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <CubeIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                        <p className="text-xs text-gray-500">{asset.code}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h2>
              <div className="space-y-3 text-xs">
                {[
                  {
                    title: 'Request Approved',
                    text: 'Your request for Dell UltraSharp 27" was approved',
                    date: 'Dec 13, 2024',
                  },
                  {
                    title: 'Ticket Updated',
                    text: 'John Admin replied to your ticket “Monitor not detected”',
                    date: 'Dec 13, 2024',
                  },
                  {
                    title: 'Asset Assigned',
                    text: 'Logitech MX Keys Mini was assigned to you',
                    date: 'Feb 10, 2024',
                  },
                  {
                    title: 'Ticket Resolved',
                    text: 'Your ticket “Request for software installation” was resolved',
                    date: 'Dec 9, 2024',
                  },
                ].map((item) => (
                  <div key={item.title + item.date} className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-gray-500">{item.text}</p>
                    </div>
                    <span className="text-gray-400 whitespace-nowrap ml-2">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pending requests + open tickets */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pending requests */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Pending Requests</h2>
              <div className="bg-[#f9fafb] rounded-xl px-4 py-4 text-xs">
                <p className="font-medium text-gray-900 mb-1">iPad Pro 12.9"</p>
                <p className="text-gray-500 mb-1">Requested on Dec 12, 2024</p>
                <p className="text-gray-500 mb-2">
                  Needed for client presentations and design reviews
                </p>
                <span className="inline-flex px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 font-medium">
                  Pending
                </span>
              </div>
            </div>

            {/* Open tickets */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Open Tickets</h2>
              <div className="bg-[#f9fafb] rounded-xl px-4 py-4 text-xs">
                <p className="font-medium text-gray-900 mb-1">
                  Monitor not detected when connected
                </p>
                <p className="text-gray-500 mb-1">Related to: TC-MON-001</p>
                <p className="text-gray-500 mb-2">Opened on Dec 13, 2024</p>
                <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                  In Progress
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const TopStatCard = ({ label, value, description }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
      <CubeIcon className="w-5 h-5 text-blue-500" />
    </div>
  </div>
);

export default EmployeeDashboard;
