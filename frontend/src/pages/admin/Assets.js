import {
  ArrowDownTrayIcon,
  PlusIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  CubeIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import AdminSidebar from '../../components/AdminSidebar';

const AssetsContent = () => (
  <main className="flex-1 px-8 py-6 space-y-5">
    {/* Header */}
    <section className="flex items-center justify-between">
      <div>
        <h1 className="text-sm font-semibold text-gray-900">Assets Management</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage and track all your organization&apos;s assets
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <button className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white hover:bg-gray-50">
          <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
          Import CSV
        </button>
        <button className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700">
          <PlusIcon className="w-4 h-4 mr-1.5" />
          Add Asset
        </button>
      </div>
    </section>

    {/* Filters */}
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
      <button className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-gray-700">
        <span>All Categories</span>
        <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-400" />
      </button>
      <div className="flex-1 mx-4">
        <div className="flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-[#f9fafb] text-xs text-gray-500">
          <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
          <input
            placeholder="Search assets..."
            className="flex-1 bg-transparent outline-none text-xs text-gray-700"
          />
        </div>
      </div>
    </section>

    {/* Table */}
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-4">Category Name</th>
              <th className="py-2 pr-4">Description</th>
              <th className="py-2 pr-4">Visibility</th>
              <th className="py-2 pr-4">Items</th>
              <th className="py-2 pr-4">Total Assets</th>
              <th className="py-2 pr-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              {
                name: 'Laptops',
                desc: 'Portable computers for work',
                visible: true,
                items: 3,
                total: 45,
              },
              {
                name: 'Monitors',
                desc: 'Display screens and monitors',
                visible: true,
                items: 2,
                total: 38,
              },
              {
                name: 'Mobile Devices',
                desc: 'Phones and tablets',
                visible: true,
                items: 5,
                total: 52,
              },
              {
                name: 'Keyboards & Mice',
                desc: 'Input devices',
                visible: true,
                items: 5,
                total: 68,
              },
              {
                name: 'Projectors',
                desc: 'Conference room projectors',
                visible: true,
                items: 2,
                total: 8,
              },
              { name: 'Servers', desc: 'Server hardware', visible: false, items: 1, total: 12 },
            ].map((row) => (
              <tr key={row.name}>
                <td className="py-2 pr-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <CubeIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <button className="text-sm text-blue-600 hover:underline">{row.name}</button>
                  </div>
                </td>
                <td className="py-2 pr-4 text-gray-500">{row.desc}</td>
                <td className="py-2 pr-4">
                  {row.visible ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-[11px] text-green-600">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      Visible to employees
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-[11px] text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                      Hidden
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4 text-gray-700">{row.items}</td>
                <td className="py-2 pr-4 text-gray-700">{row.total}</td>
                <td className="py-2 pr-2">
                  <div className="flex items-center justify-end space-x-2 text-gray-500">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100">
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                      <TrashIcon className="w-4 h-4" />
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
);

const Assets = () => (
  <div className="min-h-screen flex bg-[#f5f7fb] text-gray-800">
    <AdminSidebar active="Assets" />
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
      <AssetsContent />
    </div>
  </div>
);

export { AssetsContent };

export default Assets;
