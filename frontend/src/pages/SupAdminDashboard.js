const SupAdminDashboard = () => {
  return (
    <div className="min-h-screen flex bg-[#f7f8fc]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mr-2">
            360°
          </div>
          <span className="font-medium text-gray-800 text-sm">ThreeSixty</span>
        </div>

        <nav className="flex-1 px-2 py-3 text-sm">
          {[
            'Overview',
            'Organizations',
            'Users',
            'Assets',
            'Tickets',
            'Lost & Found',
            'Settings',
          ].map((item, i) => (
            <button
              key={item}
              className={`w-full flex items-center px-3 py-2 rounded-lg mb-1 ${
                i === 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="ml-1">{item}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div />
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
              A
            </div>
            <span className="text-sm text-gray-700">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Title */}
          <section>
            <h1 className="text-sm font-semibold text-gray-800">Dashboard Overview</h1>
            <p className="text-xs text-gray-500">
              Monitor and manage all organizations, users, and assets
            </p>
          </section>

          {/* Stat cards */}
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Organizations',
                value: 5,
                iconBg: 'bg-blue-100',
                Icon: () => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                    />
                  </svg>
                ),
              },
              {
                label: 'Pending Approvals',
                value: 2,
                iconBg: 'bg-blue-100',
                Icon: () => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                ),
              },
              {
                label: 'Total Users',
                value: 649,
                iconBg: 'bg-blue-100',
                Icon: () => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                ),
              },
              {
                label: 'Total Assets',
                value: 1846,
                iconBg: 'bg-blue-100',
                Icon: () => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                    />
                  </svg>
                ),
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">{card.label}</span>
                  <span
                    className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}
                  >
                    <card.Icon />
                  </span>
                </div>
                <span className="text-2xl font-semibold text-gray-800">{card.value}</span>
              </div>
            ))}
          </section>

          {/* Pending organizations */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Pending Organizations</h2>
              <p className="text-xs text-gray-500">Organizations waiting for approval</p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Herald College', domain: 'heraldcollege.edu.np' },
                {
                  name: 'Islington College',
                  domain: 'islingtoncollege.edu.np',
                },
              ].map((org) => (
                <div
                  key={org.domain}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{org.name}</p>
                      <p className="text-xs text-gray-500">{org.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100">
                      Deny
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent activity */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
              <p className="text-xs text-gray-500">Latest updates across all organizations</p>
            </div>

            <div className="divide-y divide-gray-100">
              {[
                {
                  iconBg: 'bg-yellow-50',
                  Icon: () => (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  ),
                  title: 'New organization registered',
                  desc: 'CloudBase Networks has submitted a new registration',
                  org: 'CloudBase Networks',
                  date: 'Dec 12',
                },
                {
                  iconBg: 'bg-green-50',
                  Icon: () => (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  ),
                  title: 'Organization approved',
                  desc: 'NextGen Solutions has been approved and activated',
                  org: 'NextGen Solutions',
                  date: 'Dec 11',
                },
                {
                  iconBg: 'bg-blue-100',
                  Icon: () => (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                  ),
                  title: 'New user added',
                  desc: 'Robert Taylor joined NextGen Solutions as Admin',
                  org: 'NextGen Solutions',
                  date: 'Dec 11',
                },
              ].map((item) => (
                <div key={item.title + item.date} className="flex items-start justify-between py-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center ${item.iconBg}`}
                    >
                      <item.Icon />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                      <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">
                        {item.org}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SupAdminDashboard;
