import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import AdminSidebar from '../../components/AdminSidebar';

const Assignment = () => {
  const [activeTab, setActiveTab] = useState('requests');

  const requests = [
    {
      name: 'Jessica Williams',
      item: 'Laptops',
      reason: 'Need laptop for new project work - current one is outdated.',
      date: 'Dec 12, 2024',
    },
    {
      name: 'David Park',
      item: 'Monitors',
      reason: 'Additional monitor for dual-screen setup',
      date: 'Dec 13, 2024',
    },
    {
      name: 'Amanda Foster',
      item: 'Mobile Devices',
      reason: 'Company phone for client communications',
      date: 'Dec 13, 2024',
    },
  ];

  const assignments = [
    {
      code: 'TC-LAP-001',
      asset: 'MacBook Pro 16" M3',
      employee: 'Sarah Johnson',
      assigned: 'Jan 20, 2024',
      due: '—',
      status: 'active',
    },
    {
      code: 'TC-LAP-002',
      asset: 'Dell XPS 15',
      employee: 'Michael Chen',
      assigned: 'Feb 25, 2024',
      due: 'Feb 25, 2025',
      status: 'active',
    },
    {
      code: 'TC-MON-001',
      asset: 'LG UltraWide 34"',
      employee: 'Sarah Johnson',
      assigned: 'Jan 22, 2024',
      due: '—',
      status: 'active',
    },
    {
      code: 'TC-MOB-001',
      asset: 'iPhone 15 Pro',
      employee: 'Emma Davis',
      assigned: 'Sep 25, 2024',
      due: '—',
      status: 'active',
    },
    {
      code: 'TC-KEY-001',
      asset: 'Logitech MX Keys',
      employee: 'Michael Chen',
      assigned: 'Feb 28, 2024',
      due: '—',
      status: 'active',
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#f5f7fb] text-gray-800">
      <AdminSidebar active="Assignments" />

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
        <main className="flex-1 px-8 py-6">
          {/* Header */}
          <section className="mb-5">
            <h1 className="text-sm font-semibold text-gray-900">Assignments &amp; Requests</h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage asset requests and track assignments
            </p>
          </section>

          {/* Card */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {/* Tabs */}
            <div className="flex items-center mb-4">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center ${
                  activeTab === 'requests' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Requests
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[11px] ${
                    activeTab === 'requests' ? 'bg-white/10' : 'bg-white text-gray-600'
                  }`}
                >
                  {requests.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`ml-2 px-4 py-1.5 rounded-full text-xs ${
                  activeTab === 'assignments'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Assignments
              </button>
            </div>

            {/* Content switches here */}
            {activeTab === 'requests' ? (
              <RequestsTable requests={requests} />
            ) : (
              <AssignmentsTable assignments={assignments} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

const RequestsTable = ({ requests }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-xs md:text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b border-gray-100">
          <th className="py-2 pr-4">Employee</th>
          <th className="py-2 pr-4">Requested Item</th>
          <th className="py-2 pr-4">Reason</th>
          <th className="py-2 pr-4 whitespace-nowrap">Request Date</th>
          <th className="py-2 pr-4">Status</th>
          <th className="py-2 pr-2 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {requests.map((row) => (
          <tr key={row.name}>
            <td className="py-2 pr-4 text-gray-800">{row.name}</td>
            <td className="py-2 pr-4">
              <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-[11px] text-blue-600">
                {row.item}
              </span>
            </td>
            <td className="py-2 pr-4 text-gray-500 text-xs">{row.reason}</td>
            <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{row.date}</td>
            <td className="py-2 pr-4">
              <span className="inline-flex px-2.5 py-1 rounded-full bg-yellow-50 text-[11px] text-yellow-600">
                pending
              </span>
            </td>
            <td className="py-2 pr-2">
              <div className="flex items-center justify-end">
                <button className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs hover:bg-blue-700">
                  Assign
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AssignmentsTable = ({ assignments }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-xs md:text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b border-gray-100">
          <th className="py-2 pr-4">Asset Code</th>
          <th className="py-2 pr-4">Asset Name</th>
          <th className="py-2 pr-4">Employee</th>
          <th className="py-2 pr-4">Assigned Date</th>
          <th className="py-2 pr-4">Due Date</th>
          <th className="py-2 pr-4">Status</th>
          <th className="py-2 pr-2">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {assignments.map((row) => (
          <tr key={row.code}>
            <td className="py-2 pr-4 text-blue-600">{row.code}</td>
            <td className="py-2 pr-4 text-gray-800">{row.asset}</td>
            <td className="py-2 pr-4 text-gray-700">{row.employee}</td>
            <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{row.assigned}</td>
            <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{row.due}</td>
            <td className="py-2 pr-4">
              <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-[11px] text-blue-600">
                {row.status}
              </span>
            </td>
            <td className="py-2 pr-2">
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 text-[11px] bg-white hover:bg-gray-50">
                  <span className="mr-1 text-xs">↺</span>
                  <span>Returned</span>
                </button>
                <button className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 text-[11px] bg-white hover:bg-gray-50">
                  <span className="mr-1 text-xs">✕</span>
                  <span>Lost</span>
                </button>
                <button className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 text-[11px] bg-white hover:bg-gray-50">
                  <span className="mr-1 text-xs">⚠</span>
                  <span>Damaged</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Assignment;
